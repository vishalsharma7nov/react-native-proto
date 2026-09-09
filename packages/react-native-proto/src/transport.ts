import { ProtoClientError, wrapUnknownError } from "./errors";
import { tryParseConnectError } from "./connect/errors";
import {
  composeInterceptors,
  type CallContext,
  type Interceptor,
} from "./interceptors";
import { createPathForMethod } from "./path-templates";
import type {
  HeaderMap,
  MethodMapEntry,
  ProtoClientConfig,
  UnaryCallInput,
} from "./types";
import type { CodecRegistry } from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_HEADER_ENTRIES = 64;

export type ResolvedTransportConfig = {
  baseUrl: string;
  timeoutMs: number;
  maxResponseBytes: number;
  transport: NonNullable<ProtoClientConfig["transport"]>;
  getHeaders?: ProtoClientConfig["getHeaders"];
  fetchImpl: typeof fetch;
  onError?: ProtoClientConfig["onError"];
  pathForMethod: (entry: MethodMapEntry) => string;
  interceptors: Interceptor[];
  retryOnUnauthorized: boolean;
};

export function resolveConfig(
  config: ProtoClientConfig,
): ResolvedTransportConfig {
  if (!config || typeof config !== "object") {
    throw new ProtoClientError({
      code: "INVALID_CONFIG",
      message: "createClient requires a config object",
    });
  }

  const baseUrl =
    typeof config.baseUrl === "string" ? config.baseUrl.trim() : "";
  if (!baseUrl) {
    throw new ProtoClientError({
      code: "INVALID_CONFIG",
      message: "baseUrl is required and must be a non-empty string",
    });
  }

  try {
    // Throws if baseUrl is not absolute
    // eslint-disable-next-line no-new
    new URL(baseUrl);
  } catch (cause) {
    throw new ProtoClientError({
      code: "INVALID_CONFIG",
      message: `baseUrl must be an absolute URL, received: ${baseUrl}`,
      cause,
    });
  }

  const timeoutMs =
    typeof config.timeoutMs === "number" && config.timeoutMs > 0
      ? Math.min(config.timeoutMs, 600_000)
      : DEFAULT_TIMEOUT_MS;

  const maxResponseBytes =
    typeof config.maxResponseBytes === "number" && config.maxResponseBytes > 0
      ? Math.min(config.maxResponseBytes, 50 * 1024 * 1024)
      : DEFAULT_MAX_RESPONSE_BYTES;

  const transport = config.transport ?? "http";
  if (
    transport !== "http" &&
    transport !== "connect" &&
    transport !== "native-grpc"
  ) {
    throw new ProtoClientError({
      code: "INVALID_CONFIG",
      message: `Unsupported transport: ${String(transport)}`,
    });
  }

  const fetchImpl = config.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new ProtoClientError({
      code: "INVALID_CONFIG",
      message: "fetch is not available; pass config.fetch",
    });
  }

  const pathForMethod =
    config.pathForMethod ?? createPathForMethod(config.pathPreset ?? "connect");

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    timeoutMs,
    maxResponseBytes,
    transport,
    getHeaders: config.getHeaders,
    fetchImpl,
    onError: config.onError,
    pathForMethod,
    interceptors: config.interceptors ?? [],
    retryOnUnauthorized: config.retryOnUnauthorized !== false,
  };
}

export async function buildHeaders(
  config: ResolvedTransportConfig,
  contentType: string,
  rpcPath: string,
  extra?: HeaderMap,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    Accept: contentType,
  };

  const merge = (source: HeaderMap | undefined) => {
    if (!source || typeof source !== "object") return;
    const keys = Object.keys(source);
    if (keys.length > MAX_HEADER_ENTRIES) {
      throw new ProtoClientError({
        code: "INVALID_ARGUMENT",
        message: `Too many headers (max ${MAX_HEADER_ENTRIES})`,
        rpcPath,
      });
    }
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (!key) continue;
      const value = source[key];
      if (typeof value === "string") {
        headers[key] = value;
      }
    }
  };

  if (config.getHeaders) {
    let fromConfig: HeaderMap;
    try {
      fromConfig = await config.getHeaders();
    } catch (cause) {
      throw new ProtoClientError({
        code: "INVALID_ARGUMENT",
        message: "getHeaders() failed",
        rpcPath,
        cause,
      });
    }
    merge(fromConfig);
  }

  merge(extra);
  return headers;
}

function mapHttpStatus(
  status: number,
  rpcPath: string,
  bodyText: string,
): ProtoClientError {
  if (bodyText) {
    const connectErr = tryParseConnectError(bodyText, rpcPath, status);
    if (connectErr) {
      return connectErr;
    }
  }
  const retryable = status === 408 || status === 429 || status >= 500;
  return new ProtoClientError({
    code: "HTTP",
    message: `HTTP ${status} for ${rpcPath}${bodyText ? `: ${bodyText.slice(0, 200)}` : ""}`,
    status,
    rpcPath,
    retryable,
  });
}

async function readBodyBytes(
  response: Response,
  maxResponseBytes: number,
  rpcPath: string,
): Promise<Uint8Array> {
  const lengthHeader = response.headers.get("content-length");
  if (lengthHeader) {
    const declared = Number(lengthHeader);
    if (Number.isFinite(declared) && declared > maxResponseBytes) {
      throw new ProtoClientError({
        code: "PAYLOAD_TOO_LARGE",
        message: `Response Content-Length ${declared} exceeds maxResponseBytes ${maxResponseBytes}`,
        rpcPath,
        status: response.status,
      });
    }
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > maxResponseBytes) {
    throw new ProtoClientError({
      code: "PAYLOAD_TOO_LARGE",
      message: `Response size ${buffer.byteLength} exceeds maxResponseBytes ${maxResponseBytes}`,
      rpcPath,
      status: response.status,
    });
  }

  return new Uint8Array(buffer);
}

async function unaryCallCore(
  config: ResolvedTransportConfig,
  codecs: CodecRegistry,
  input: UnaryCallInput,
): Promise<Record<string, unknown>> {
  const { entry, request, signal } = input;
  const rpcPath = entry.rpcPath;

  if (config.transport === "native-grpc") {
    const { nativeGrpcUnary } = await import("./native-grpc");
    return nativeGrpcUnary(config, codecs, input);
  }

  const requestCodec = codecs.get(entry.requestType);
  const responseCodec = codecs.get(entry.responseType);
  if (!requestCodec || !responseCodec) {
    throw new ProtoClientError({
      code: "INVALID_ARGUMENT",
      message: `Missing codec for ${entry.requestType} or ${entry.responseType}`,
      rpcPath,
    });
  }

  let body: Uint8Array;
  try {
    body = requestCodec.encode(request ?? {});
  } catch (cause) {
    throw new ProtoClientError({
      code: "INVALID_ARGUMENT",
      message: `Failed to encode request for ${rpcPath}`,
      rpcPath,
      cause,
    });
  }

  const path = config.pathForMethod(entry);
  const url = `${config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const contentType =
    config.transport === "connect"
      ? "application/proto"
      : "application/x-protobuf";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw new ProtoClientError({
        code: "ABORTED",
        message: "Request was aborted before send",
        rpcPath,
      });
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    const headers = await buildHeaders(
      config,
      contentType,
      rpcPath,
      input.headers,
    );
    if (config.transport === "connect") {
      headers["Connect-Protocol-Version"] = "1";
    }

    let response: Response;
    try {
      response = await config.fetchImpl(url, {
        method: "POST",
        headers,
        body: body as unknown as BodyInit,
        signal: controller.signal,
      });
    } catch (cause) {
      if (controller.signal.aborted) {
        const abortedByCaller = Boolean(signal?.aborted);
        throw new ProtoClientError({
          code: abortedByCaller ? "ABORTED" : "TIMEOUT",
          message: abortedByCaller
            ? "Request was aborted"
            : `Request timed out after ${config.timeoutMs}ms`,
          rpcPath,
          cause,
          retryable: !abortedByCaller,
        });
      }

      throw new ProtoClientError({
        code: "NETWORK",
        message: `Network error calling ${rpcPath}`,
        rpcPath,
        cause,
        retryable: true,
      });
    }

    if (!response.ok) {
      let text = "";
      try {
        text = await response.text();
      } catch {
        text = "";
      }
      throw mapHttpStatus(response.status, rpcPath, text);
    }

    const bytes = await readBodyBytes(
      response,
      config.maxResponseBytes,
      rpcPath,
    );

    // Connect unary may still return raw proto; if JSON end-stream sneaks in, map it.
    const contentTypeHeader = response.headers.get("content-type") || "";
    if (
      config.transport === "connect" &&
      contentTypeHeader.includes("json") &&
      bytes.byteLength > 0
    ) {
      const text = new TextDecoder().decode(bytes);
      const connectErr = tryParseConnectError(text, rpcPath, response.status);
      if (connectErr) {
        throw connectErr;
      }
    }

    try {
      return responseCodec.decode(bytes);
    } catch (cause) {
      throw new ProtoClientError({
        code: "DECODE",
        message: `Failed to decode response for ${rpcPath}`,
        rpcPath,
        cause,
        status: response.status,
      });
    }
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", onAbort);
    }
  }
}

function notifyOnError(
  config: ResolvedTransportConfig,
  error: ReturnType<typeof wrapUnknownError>,
): void {
  if (!config.onError) {
    return;
  }
  try {
    config.onError(error);
  } catch {
    // Logging hooks must not replace throw behavior
  }
}

export async function unaryCall(
  config: ResolvedTransportConfig,
  codecs: CodecRegistry,
  input: UnaryCallInput,
): Promise<Record<string, unknown>> {
  const { entry, request, signal } = input;
  const rpcPath = entry.rpcPath;

  const core = async (ctx: CallContext) =>
    unaryCallCore(config, codecs, {
      entry: ctx.entry,
      request: ctx.request,
      signal: ctx.signal,
      headers: ctx.headers,
    });

  const pipeline =
    config.interceptors.length > 0
      ? composeInterceptors(config.interceptors, core)
      : core;

  try {
    return await pipeline({
      entry,
      request: request ?? {},
      headers: input.headers ?? {},
      signal,
    });
  } catch (error) {
    const wrapped = wrapUnknownError(error, rpcPath);

    // Optional transport-level single retry on 401 when no auth interceptor handled it
    if (
      config.retryOnUnauthorized &&
      config.interceptors.length === 0 &&
      wrapped.status === 401 &&
      config.getHeaders
    ) {
      try {
        return await unaryCallCore(config, codecs, input);
      } catch (retryError) {
        const retryWrapped = wrapUnknownError(retryError, rpcPath);
        notifyOnError(config, retryWrapped);
        throw retryWrapped;
      }
    }

    notifyOnError(config, wrapped);
    throw wrapped;
  }
}

import { ProtoClientError } from '../errors';
import type { ResolvedTransportConfig } from '../transport';
import type { CodecRegistry, StreamCallInput, UnaryCallInput } from '../types';

type NativeBridge = {
  unary: (input: {
    baseUrl: string;
    rpcPath: string;
    requestBytes: Uint8Array;
    headers: Record<string, string>;
    timeoutMs: number;
  }) => Promise<Uint8Array>;
  stream?: (input: {
    baseUrl: string;
    rpcPath: string;
    requestBytes: Uint8Array;
    headers: Record<string, string>;
    timeoutMs: number;
  }) => AsyncIterable<Uint8Array>;
};

type NativeGrpcModule = {
  unary: (
    baseUrl: string,
    rpcPath: string,
    requestBase64: string,
    headersJson: string,
    timeoutMs: number
  ) => Promise<string>;
  isAvailable?: () => Promise<boolean>;
};

declare global {
  // Optional native module injected by the host app / TurboModule
  // eslint-disable-next-line no-var
  var __REACT_NATIVE_PROTO_NATIVE_GRPC__: NativeBridge | undefined;
}

type BufferLike = {
  from(
    data: string | Uint8Array,
    encoding?: string
  ): Uint8Array & { toString(encoding: string): string };
};

function getGlobalBuffer(): BufferLike | undefined {
  const candidate = (globalThis as { Buffer?: BufferLike }).Buffer;
  return typeof candidate?.from === 'function' ? candidate : undefined;
}

/** Encode bytes to base64 without requiring a Buffer polyfill on RN. */
export function bytesToBase64(bytes: Uint8Array): string {
  const BufferCtor = getGlobalBuffer();
  if (BufferCtor) {
    return BufferCtor.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  if (typeof btoa !== 'function') {
    throw new Error('base64 encode unavailable (no Buffer or btoa)');
  }
  return btoa(binary);
}

/** Decode base64 to bytes without requiring a Buffer polyfill on RN. */
export function base64ToBytes(base64: string): Uint8Array {
  const BufferCtor = getGlobalBuffer();
  if (BufferCtor) {
    const buf = BufferCtor.from(base64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  if (typeof atob !== 'function') {
    throw new Error('base64 decode unavailable (no Buffer or atob)');
  }
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function getNativeModule(): NativeGrpcModule | undefined {
  try {
    // Optional peer — do not hard-depend at module load time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rn = require('react-native') as {
      NativeModules?: { ReactNativeProtoNativeGrpc?: NativeGrpcModule };
    };
    const mod = rn.NativeModules?.ReactNativeProtoNativeGrpc;
    if (mod && typeof mod.unary === 'function') {
      return mod;
    }
  } catch {
    // Not running in React Native, or NativeModules unavailable.
  }
  return undefined;
}

function createBridgeFromNativeModule(mod: NativeGrpcModule): NativeBridge {
  return {
    async unary({ baseUrl, rpcPath, requestBytes, headers, timeoutMs }) {
      const responseBase64 = await mod.unary(
        baseUrl,
        rpcPath,
        bytesToBase64(requestBytes),
        JSON.stringify(headers ?? {}),
        timeoutMs
      );
      if (typeof responseBase64 !== 'string') {
        throw new Error('Native unary did not return a base64 string');
      }
      return base64ToBytes(responseBase64);
    },
  };
}

/**
 * Wire `NativeModules.ReactNativeProtoNativeGrpc` into
 * `global.__REACT_NATIVE_PROTO_NATIVE_GRPC__` for the JS transport layer.
 * Returns true when the bridge was installed.
 */
export function installNativeGrpcBridgeFromNativeModule(): boolean {
  const mod = getNativeModule();
  if (!mod) {
    return false;
  }
  globalThis.__REACT_NATIVE_PROTO_NATIVE_GRPC__ =
    createBridgeFromNativeModule(mod);
  return true;
}

function getBridge(): NativeBridge {
  const existing = globalThis.__REACT_NATIVE_PROTO_NATIVE_GRPC__;
  if (existing && typeof existing.unary === 'function') {
    return existing;
  }

  if (installNativeGrpcBridgeFromNativeModule()) {
    const installed = globalThis.__REACT_NATIVE_PROTO_NATIVE_GRPC__;
    if (installed && typeof installed.unary === 'function') {
      return installed;
    }
  }

  throw new ProtoClientError({
    code: 'UNSUPPORTED',
    message:
      'Native gRPC bridge is not installed. Link the native module or use transport "http" / "connect".',
  });
}

async function headersFromConfig(
  config: ResolvedTransportConfig,
  rpcPath: string
): Promise<Record<string, string>> {
  if (!config.getHeaders) {
    return {};
  }
  try {
    return await config.getHeaders();
  } catch (cause) {
    throw new ProtoClientError({
      code: 'INVALID_ARGUMENT',
      message: 'getHeaders() failed',
      rpcPath,
      cause,
    });
  }
}

export async function nativeGrpcUnary(
  config: ResolvedTransportConfig,
  codecs: CodecRegistry,
  input: UnaryCallInput
): Promise<Record<string, unknown>> {
  const bridge = getBridge();
  const { entry, request } = input;
  const requestCodec = codecs.get(entry.requestType);
  const responseCodec = codecs.get(entry.responseType);
  if (!requestCodec || !responseCodec) {
    throw new ProtoClientError({
      code: 'INVALID_ARGUMENT',
      message: `Missing codec for ${entry.requestType} or ${entry.responseType}`,
      rpcPath: entry.rpcPath,
    });
  }

  let requestBytes: Uint8Array;
  try {
    requestBytes = requestCodec.encode(request ?? {});
  } catch (cause) {
    throw new ProtoClientError({
      code: 'INVALID_ARGUMENT',
      message: `Failed to encode request for ${entry.rpcPath}`,
      rpcPath: entry.rpcPath,
      cause,
    });
  }

  const headers = await headersFromConfig(config, entry.rpcPath);

  let responseBytes: Uint8Array;
  try {
    responseBytes = await bridge.unary({
      baseUrl: config.baseUrl,
      rpcPath: entry.rpcPath,
      requestBytes,
      headers,
      timeoutMs: config.timeoutMs,
    });
  } catch (cause) {
    throw new ProtoClientError({
      code: 'RPC',
      message: `Native gRPC call failed for ${entry.rpcPath}`,
      rpcPath: entry.rpcPath,
      cause,
      retryable: true,
    });
  }

  if (responseBytes.byteLength > config.maxResponseBytes) {
    throw new ProtoClientError({
      code: 'PAYLOAD_TOO_LARGE',
      message: `Native response exceeds maxResponseBytes ${config.maxResponseBytes}`,
      rpcPath: entry.rpcPath,
    });
  }

  try {
    return responseCodec.decode(responseBytes);
  } catch (cause) {
    throw new ProtoClientError({
      code: 'DECODE',
      message: `Failed to decode native gRPC response for ${entry.rpcPath}`,
      rpcPath: entry.rpcPath,
      cause,
    });
  }
}

export async function* nativeGrpcStream(
  config: ResolvedTransportConfig,
  codecs: CodecRegistry,
  input: StreamCallInput
): AsyncGenerator<Record<string, unknown>, void, undefined> {
  const bridge = getBridge();
  if (typeof bridge.stream !== 'function') {
    throw new ProtoClientError({
      code: 'UNSUPPORTED',
      message: 'Native gRPC bridge does not implement streaming',
      rpcPath: input.entry.rpcPath,
    });
  }

  const { entry, request } = input;
  const requestCodec = codecs.get(entry.requestType);
  const responseCodec = codecs.get(entry.responseType);
  if (!requestCodec || !responseCodec) {
    throw new ProtoClientError({
      code: 'INVALID_ARGUMENT',
      message: `Missing codec for ${entry.requestType} or ${entry.responseType}`,
      rpcPath: entry.rpcPath,
    });
  }

  const requestBytes = requestCodec.encode(request ?? {});
  const headers = await headersFromConfig(config, entry.rpcPath);
  const frames = bridge.stream({
    baseUrl: config.baseUrl,
    rpcPath: entry.rpcPath,
    requestBytes,
    headers,
    timeoutMs: config.timeoutMs,
  });

  for await (const frame of frames) {
    if (frame.byteLength > config.maxResponseBytes) {
      throw new ProtoClientError({
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Native stream frame exceeds maxResponseBytes',
        rpcPath: entry.rpcPath,
      });
    }
    const message = responseCodec.decode(frame);
    if (input.onMessage) {
      input.onMessage(message);
    }
    yield message;
  }
}

export function isNativeGrpcAvailable(): boolean {
  if (
    typeof globalThis.__REACT_NATIVE_PROTO_NATIVE_GRPC__?.unary === 'function'
  ) {
    return true;
  }
  return getNativeModule() != null;
}

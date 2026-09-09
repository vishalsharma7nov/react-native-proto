import {
  CONNECT_FLAG_END_STREAM,
  decodeConnectEnvelopes,
  encodeConnectEnvelope,
  readConnectEnvelopeStream,
} from './connect/envelope';
import {
  bytesToUtf8,
  connectErrorFromJson,
  tryParseConnectError,
} from './connect/errors';
import { ProtoClientError } from './errors';
import { buildHeaders, unaryCall, type ResolvedTransportConfig } from './transport';
import type { CodecRegistry, MessageCodec, StreamCallInput } from './types';

async function collectRequests(
  input: StreamCallInput
): Promise<Record<string, unknown>[]> {
  if (input.requests) {
    const list: Record<string, unknown>[] = [];
    for await (const item of input.requests as AsyncIterable<
      Record<string, unknown>
    >) {
      list.push(item);
    }
    return list;
  }
  return [input.request ?? {}];
}

function buildConnectRequestBody(
  entryKind: string,
  requests: Record<string, unknown>[],
  requestCodec: MessageCodec
): Uint8Array {
  const useEnvelopedRequest =
    entryKind === 'clientStreaming' ||
    entryKind === 'bidi' ||
    requests.length > 1;

  if (!useEnvelopedRequest) {
    return requestCodec.encode(requests[0] ?? {});
  }

  const frames: Uint8Array[] = [];
  for (let i = 0; i < requests.length; i += 1) {
    frames.push(encodeConnectEnvelope(requestCodec.encode(requests[i] ?? {}), 0));
  }
  if (entryKind === 'clientStreaming' || entryKind === 'bidi') {
    frames.push(encodeConnectEnvelope(new Uint8Array(0), CONNECT_FLAG_END_STREAM));
  }

  let bodyLength = 0;
  for (let i = 0; i < frames.length; i += 1) {
    bodyLength += frames[i]!.byteLength;
  }
  const body = new Uint8Array(bodyLength);
  let offset = 0;
  for (let i = 0; i < frames.length; i += 1) {
    body.set(frames[i]!, offset);
    offset += frames[i]!.byteLength;
  }
  return body;
}

function throwIfEndStreamError(
  data: Uint8Array,
  rpcPath: string,
  status?: number
): void {
  if (data.byteLength === 0) {
    return;
  }
  const json = JSON.parse(bytesToUtf8(data)) as {
    error?: { code?: string; message?: string };
    code?: string;
    message?: string;
  };
  const errBody = json.error ?? json;
  if (errBody.code || errBody.message) {
    throw connectErrorFromJson(errBody, rpcPath, status);
  }
}

async function* yieldConnectEnvelopes(
  envelopes: { flags: number; data: Uint8Array }[],
  responseCodec: MessageCodec,
  input: StreamCallInput,
  status?: number
): AsyncGenerator<Record<string, unknown>, void, undefined> {
  for (let i = 0; i < envelopes.length; i += 1) {
    const envelope = envelopes[i]!;
    if (envelope.flags & CONNECT_FLAG_END_STREAM) {
      throwIfEndStreamError(envelope.data, input.entry.rpcPath, status);
      return;
    }
    const message = responseCodec.decode(envelope.data);
    if (input.onMessage) {
      input.onMessage(message);
    }
    yield message;
  }
}

async function fetchConnectStreamResponse(
  config: ResolvedTransportConfig,
  input: StreamCallInput,
  requestBody: Uint8Array
): Promise<Response> {
  const path = config.pathForMethod(input.entry);
  const url = `${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = await buildHeaders(
    config,
    'application/connect+proto',
    input.entry.rpcPath,
    input.headers
  );
  headers['Connect-Protocol-Version'] = '1';
  headers.Accept = 'application/connect+proto';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);
  const onAbort = () => controller.abort();

  if (input.signal) {
    if (input.signal.aborted) {
      clearTimeout(timeoutId);
      throw new ProtoClientError({
        code: 'ABORTED',
        message: 'Request was aborted before send',
        rpcPath: input.entry.rpcPath,
      });
    }
    input.signal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    try {
      return await config.fetchImpl(url, {
        method: 'POST',
        headers,
        body: requestBody as unknown as BodyInit,
        signal: controller.signal,
      });
    } catch (cause) {
      if (controller.signal.aborted) {
        throw new ProtoClientError({
          code: input.signal?.aborted ? 'ABORTED' : 'TIMEOUT',
          message: input.signal?.aborted
            ? 'Request was aborted'
            : `Stream timed out after ${config.timeoutMs}ms`,
          rpcPath: input.entry.rpcPath,
          cause,
          retryable: !input.signal?.aborted,
        });
      }
      throw new ProtoClientError({
        code: 'NETWORK',
        message: `Network error streaming ${input.entry.rpcPath}`,
        rpcPath: input.entry.rpcPath,
        cause,
        retryable: true,
      });
    }
  } finally {
    clearTimeout(timeoutId);
    if (input.signal) {
      input.signal.removeEventListener('abort', onAbort);
    }
  }
}

function assertOkConnectResponse(response: Response, rpcPath: string): void {
  if (response.ok) {
    return;
  }
  // Body already consumed by caller via text() if needed — here we only throw generic.
  throw new ProtoClientError({
    code: 'HTTP',
    message: `HTTP ${response.status} for ${rpcPath}`,
    status: response.status,
    rpcPath,
    retryable: response.status >= 500,
  });
}

async function* streamConnect(
  config: ResolvedTransportConfig,
  codecs: CodecRegistry,
  input: StreamCallInput
): AsyncGenerator<Record<string, unknown>, void, undefined> {
  const { entry } = input;
  const requestCodec = codecs.get(entry.requestType);
  const responseCodec = codecs.get(entry.responseType);
  if (!requestCodec || !responseCodec) {
    throw new ProtoClientError({
      code: 'INVALID_ARGUMENT',
      message: `Missing codec for ${entry.requestType} or ${entry.responseType}`,
      rpcPath: entry.rpcPath,
    });
  }

  const requests = await collectRequests(input);
  if (
    (entry.kind === 'clientStreaming' || entry.kind === 'bidi') &&
    requests.length === 0
  ) {
    throw new ProtoClientError({
      code: 'INVALID_ARGUMENT',
      message: 'Client streaming requires at least one request message',
      rpcPath: entry.rpcPath,
    });
  }

  const requestBody = buildConnectRequestBody(entry.kind, requests, requestCodec);
  const response = await fetchConnectStreamResponse(config, input, requestBody);

  if (!response.ok) {
    let text = '';
    try {
      text = await response.text();
    } catch {
      text = '';
    }
    const connectErr = tryParseConnectError(text, entry.rpcPath, response.status);
    if (connectErr) {
      throw connectErr;
    }
    assertOkConnectResponse(response, entry.rpcPath);
  }

  const contentType = response.headers.get('content-type') || '';

  if (response.body && typeof response.body.getReader === 'function') {
    for await (const envelope of readConnectEnvelopeStream(
      response.body,
      config.maxResponseBytes
    )) {
      if (envelope.flags & CONNECT_FLAG_END_STREAM) {
        throwIfEndStreamError(envelope.data, entry.rpcPath, response.status);
        return;
      }
      const message = responseCodec.decode(envelope.data);
      if (input.onMessage) {
        input.onMessage(message);
      }
      yield message;
    }
    return;
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength > config.maxResponseBytes) {
    throw new ProtoClientError({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Stream response exceeds maxResponseBytes',
      rpcPath: entry.rpcPath,
    });
  }

  const looksLikeRawProto =
    contentType.includes('proto') &&
    !contentType.includes('connect') &&
    buffer.byteLength > 0 &&
    buffer[0]! > 2;

  if (looksLikeRawProto) {
    const message = await unaryCall(config, codecs, input);
    if (input.onMessage) {
      input.onMessage(message);
    }
    yield message;
    return;
  }

  const envelopes = decodeConnectEnvelopes(buffer);
  if (envelopes.length === 0 && buffer.byteLength > 0) {
    const message = responseCodec.decode(buffer);
    if (input.onMessage) {
      input.onMessage(message);
    }
    yield message;
    return;
  }

  yield* yieldConnectEnvelopes(envelopes, responseCodec, input, response.status);
}

/**
 * Streaming helpers.
 * - HTTP+protobuf: unary only
 * - Connect: server-streaming via envelope frames; client/bidi send enveloped requests
 * - native-grpc: bridge streaming when available
 */
export async function* streamCall(
  config: ResolvedTransportConfig,
  codecs: CodecRegistry,
  input: StreamCallInput
): AsyncGenerator<Record<string, unknown>, void, undefined> {
  const { entry } = input;

  if (entry.kind === 'unary') {
    throw new ProtoClientError({
      code: 'UNSUPPORTED',
      message: `Method ${entry.rpcPath} is unary; use the promise API`,
      rpcPath: entry.rpcPath,
    });
  }

  if (config.transport === 'http') {
    throw new ProtoClientError({
      code: 'UNSUPPORTED',
      message:
        'Streaming requires transport "connect" or "native-grpc". HTTP+protobuf is unary-only.',
      rpcPath: entry.rpcPath,
    });
  }

  if (config.transport === 'native-grpc') {
    const { nativeGrpcStream } = await import('./native-grpc');
    yield* nativeGrpcStream(config, codecs, input);
    return;
  }

  yield* streamConnect(config, codecs, input);
}

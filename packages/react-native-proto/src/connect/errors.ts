import { ProtoClientError, type ProtoErrorCode } from '../errors';

/** Connect / gRPC-like code strings → client error codes */
const CONNECT_CODE_MAP: Record<string, ProtoErrorCode> = {
  canceled: 'ABORTED',
  unknown: 'RPC',
  invalid_argument: 'INVALID_ARGUMENT',
  deadline_exceeded: 'TIMEOUT',
  not_found: 'RPC',
  already_exists: 'RPC',
  permission_denied: 'RPC',
  resource_exhausted: 'RPC',
  failed_precondition: 'RPC',
  aborted: 'ABORTED',
  out_of_range: 'INVALID_ARGUMENT',
  unimplemented: 'UNSUPPORTED',
  internal: 'INTERNAL',
  unavailable: 'NETWORK',
  data_loss: 'DECODE',
  unauthenticated: 'RPC',
};

export type ConnectErrorBody = {
  code?: string;
  message?: string;
  details?: unknown[];
};

export function mapConnectCode(code: string | undefined): ProtoErrorCode {
  if (!code) return 'RPC';
  return CONNECT_CODE_MAP[code.toLowerCase()] ?? 'RPC';
}

export function connectErrorFromJson(
  body: ConnectErrorBody,
  rpcPath: string,
  status?: number
): ProtoClientError {
  const connectCode = (body.code ?? 'unknown').toLowerCase();
  const retryable =
    connectCode === 'unavailable' ||
    connectCode === 'resource_exhausted' ||
    connectCode === 'deadline_exceeded';

  return new ProtoClientError({
    code: mapConnectCode(connectCode),
    message: body.message
      ? `Connect ${connectCode}: ${body.message}`
      : `Connect error ${connectCode} for ${rpcPath}`,
    status,
    rpcPath,
    retryable,
    cause: body,
  });
}

export function tryParseConnectError(
  text: string,
  rpcPath: string,
  status?: number
): ProtoClientError | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as ConnectErrorBody;
    if (parsed && (parsed.code || parsed.message)) {
      return connectErrorFromJson(parsed, rpcPath, status);
    }
  } catch {
    return null;
  }
  return null;
}

export function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  let out = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    out += String.fromCharCode(bytes[i]!);
  }
  return out;
}

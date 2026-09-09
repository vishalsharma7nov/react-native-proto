export type ProtoErrorCode =
  | 'INVALID_CONFIG'
  | 'INVALID_ARGUMENT'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'HTTP'
  | 'RPC'
  | 'DECODE'
  | 'PAYLOAD_TOO_LARGE'
  | 'ABORTED'
  | 'INTERNAL'
  | 'UNSUPPORTED';

export type ProtoClientErrorOptions = {
  code: ProtoErrorCode;
  message: string;
  status?: number;
  rpcPath?: string;
  cause?: unknown;
  retryable?: boolean;
};

export class ProtoClientError extends Error {
  readonly code: ProtoErrorCode;
  readonly status?: number;
  readonly rpcPath?: string;
  readonly cause?: unknown;
  readonly retryable: boolean;

  constructor(options: ProtoClientErrorOptions) {
    super(options.message);
    this.name = 'ProtoClientError';
    this.code = options.code;
    this.status = options.status;
    this.rpcPath = options.rpcPath;
    this.cause = options.cause;
    this.retryable = options.retryable === true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isProtoClientError(value: unknown): value is ProtoClientError {
  return value instanceof ProtoClientError;
}

export function getErrorCode(value: unknown): ProtoErrorCode | undefined {
  if (isProtoClientError(value)) {
    return value.code;
  }
  return undefined;
}

export function wrapUnknownError(
  value: unknown,
  rpcPath?: string
): ProtoClientError {
  if (isProtoClientError(value)) {
    return value;
  }

  if (value instanceof Error && value.name === 'AbortError') {
    return new ProtoClientError({
      code: 'ABORTED',
      message: 'Request was aborted',
      rpcPath,
      cause: value,
      retryable: false,
    });
  }

  const message =
    value instanceof Error ? value.message : 'Unexpected client failure';

  return new ProtoClientError({
    code: 'INTERNAL',
    message,
    rpcPath,
    cause: value,
    retryable: false,
  });
}

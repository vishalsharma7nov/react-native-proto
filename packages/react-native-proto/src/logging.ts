import type { Interceptor } from './interceptors';

export type LoggingOptions = {
  /** Log function (default console.debug) */
  log?: (message: string, meta?: Record<string, unknown>) => void;
  /** Redact these header names (case-insensitive). Default: authorization, cookie. */
  redactHeaders?: string[];
  /** Include request object in logs (default false — can contain PII). */
  logRequestBody?: boolean;
  /** Include response object in logs (default false). */
  logResponseBody?: boolean;
};

function redact(
  headers: Record<string, string>,
  names: string[]
): Record<string, string> {
  const blocked = new Set(names.map((n) => n.toLowerCase()));
  const out: Record<string, string> = {};
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (!key) continue;
    out[key] = blocked.has(key.toLowerCase()) ? '[redacted]' : headers[key]!;
  }
  return out;
}

/**
 * Request/response logging interceptor for debug builds.
 */
export function createLoggingInterceptor(
  options: LoggingOptions = {}
): Interceptor {
  const log = options.log ?? ((msg, meta) => console.debug(msg, meta));
  const redactHeaders = options.redactHeaders ?? [
    'authorization',
    'cookie',
    'set-cookie',
  ];

  return async (ctx, next) => {
    const started = Date.now();
    log('proto:request', {
      rpcPath: ctx.entry.rpcPath,
      headers: redact(ctx.headers, redactHeaders),
      ...(options.logRequestBody ? { request: ctx.request } : {}),
    });

    try {
      const response = await next(ctx);
      log('proto:response', {
        rpcPath: ctx.entry.rpcPath,
        durationMs: Date.now() - started,
        ...(options.logResponseBody ? { response } : {}),
      });
      return response;
    } catch (error) {
      log('proto:error', {
        rpcPath: ctx.entry.rpcPath,
        durationMs: Date.now() - started,
        error,
      });
      throw error;
    }
  };
}

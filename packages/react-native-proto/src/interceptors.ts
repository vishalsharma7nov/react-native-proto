import type { HeaderMap, MethodMapEntry } from './types';

export type CallContext = {
  entry: MethodMapEntry;
  request: Record<string, unknown>;
  headers: HeaderMap;
  signal?: AbortSignal;
};

export type UnaryHandler = (
  ctx: CallContext
) => Promise<Record<string, unknown>>;

/**
 * Interceptor around a unary RPC. Call `next(ctx)` to continue the chain.
 */
export type Interceptor = (
  ctx: CallContext,
  next: UnaryHandler
) => Promise<Record<string, unknown>>;

/**
 * Compose interceptors left-to-outer (first runs first on the way in).
 */
export function composeInterceptors(
  interceptors: Interceptor[],
  core: UnaryHandler
): UnaryHandler {
  return interceptors.reduceRight<UnaryHandler>((next, interceptor) => {
    return (ctx) => interceptor(ctx, next);
  }, core);
}

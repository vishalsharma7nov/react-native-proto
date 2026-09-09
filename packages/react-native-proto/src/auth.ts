import { isProtoClientError } from "./errors";
import type { Interceptor } from "./interceptors";
import type { HeaderMap } from "./types";

export type AuthInterceptorOptions = {
  /** Return the current access token (without "Bearer " prefix unless you prefer that). */
  getAccessToken: () => string | null | Promise<string | null>;
  /** Header name (default Authorization) */
  headerName?: string;
  /** Prefix before token (default "Bearer ") */
  scheme?: string;
  /**
   * Called once when the server returns unauthorized; should refresh and return
   * a new token. The failed call is retried once with the new token.
   */
  refreshAccessToken?: () => Promise<string | null>;
  /** Decide whether an error should trigger refresh (default: HTTP 401 or UNAUTHENTICATED). */
  isUnauthorized?: (error: unknown) => boolean;
};

function defaultIsUnauthorized(error: unknown): boolean {
  if (!isProtoClientError(error)) {
    return false;
  }
  if (error.status === 401) {
    return true;
  }
  const msg = error.message.toLowerCase();
  return (
    error.code === "RPC" &&
    (msg.includes("unauthenticated") || msg.includes("unauthorized"))
  );
}

/**
 * Adds Authorization (or custom) headers and optionally retries once after refresh.
 */
export function createAuthInterceptor(
  options: AuthInterceptorOptions,
): Interceptor {
  const headerName = options.headerName ?? "Authorization";
  const scheme = options.scheme ?? "Bearer ";
  const isUnauthorized = options.isUnauthorized ?? defaultIsUnauthorized;

  return async (ctx, next) => {
    const applyToken = (
      headers: HeaderMap,
      token: string | null,
    ): HeaderMap => {
      if (!token) {
        return headers;
      }
      return {
        ...headers,
        [headerName]: token.startsWith(scheme) ? token : `${scheme}${token}`,
      };
    };

    const token = await options.getAccessToken();
    const firstCtx = {
      ...ctx,
      headers: applyToken(ctx.headers, token),
    };

    try {
      return await next(firstCtx);
    } catch (error) {
      if (!options.refreshAccessToken || !isUnauthorized(error)) {
        throw error;
      }

      const refreshed = await options.refreshAccessToken();
      const retryCtx = {
        ...ctx,
        headers: applyToken(ctx.headers, refreshed),
      };
      return next(retryCtx);
    }
  };
}

/**
 * Simple helper that only injects a static or async token (no refresh).
 */
export function createBearerTokenHeaders(
  getToken: () => string | null | Promise<string | null>,
): () => Promise<HeaderMap> {
  return async (): Promise<HeaderMap> => {
    const token = await getToken();
    if (!token) {
      return {};
    }
    return {
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    };
  };
}

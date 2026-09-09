import { ProtoClientError } from './errors';
import type { HeaderMap } from './types';
import type { Interceptor } from './interceptors';

export const CLIENT_VERSION_HEADER = 'X-React-Native-Proto-Client-Version';
export const SERVER_MIN_CLIENT_HEADER = 'X-React-Native-Proto-Min-Client-Version';
export const METHOD_MAP_HASH_HEADER = 'X-React-Native-Proto-Method-Map-Hash';

export type VersionCheckOptions = {
  /** Semver or opaque version string sent on every request */
  clientVersion: string;
  /** Optional hash/fingerprint of the generated method map */
  methodMapHash?: string;
  /**
   * If the response includes SERVER_MIN_CLIENT_HEADER and client is older,
   * throw (default) or only warn via onMismatch.
   */
  mode?: 'throw' | 'warn';
  onMismatch?: (info: {
    clientVersion: string;
    serverMinClientVersion: string;
  }) => void;
  compareVersions?: (client: string, serverMin: string) => number;
};

/** Simple dotted numeric compare: 1.2.0 vs 1.10.0. Non-numeric falls back to string cmp. */
export function compareDottedVersions(a: string, b: string): number {
  const pa = a.split('.').map((p) => Number.parseInt(p, 10));
  const pb = b.split('.').map((p) => Number.parseInt(p, 10));
  if (pa.some((n) => Number.isNaN(n)) || pb.some((n) => Number.isNaN(n))) {
    return a === b ? 0 : a < b ? -1 : 1;
  }
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const av = pa[i] ?? 0;
    const bv = pb[i] ?? 0;
    if (av < bv) return -1;
    if (av > bv) return 1;
  }
  return 0;
}

export function versionHeaders(options: {
  clientVersion: string;
  methodMapHash?: string;
}): HeaderMap {
  const headers: HeaderMap = {
    [CLIENT_VERSION_HEADER]: options.clientVersion,
  };
  if (options.methodMapHash) {
    headers[METHOD_MAP_HASH_HEADER] = options.methodMapHash;
  }
  return headers;
}

/**
 * Attaches client version headers. Pair with `assertServerMinClient` after responses
 * if you read response headers in a custom transport; for the default HTTP path,
 * use `createVersionInterceptor` which only sends headers (response check needs
 * fetch wrapper — see createVersionAwareFetch).
 */
export function createVersionInterceptor(
  options: VersionCheckOptions
): Interceptor {
  return async (ctx, next) => {
    const headers = {
      ...ctx.headers,
      ...versionHeaders({
        clientVersion: options.clientVersion,
        methodMapHash: options.methodMapHash,
      }),
    };
    return next({ ...ctx, headers });
  };
}

export function assertServerMinClient(
  serverMinClientVersion: string | null | undefined,
  options: VersionCheckOptions
): void {
  if (!serverMinClientVersion) return;
  const compare = options.compareVersions ?? compareDottedVersions;
  if (compare(options.clientVersion, serverMinClientVersion) < 0) {
    const info = {
      clientVersion: options.clientVersion,
      serverMinClientVersion,
    };
    if (options.onMismatch) {
      options.onMismatch(info);
    }
    if (options.mode === 'warn') {
      return;
    }
    throw new ProtoClientError({
      code: 'INVALID_CONFIG',
      message: `Client version ${options.clientVersion} is older than server minimum ${serverMinClientVersion}`,
    });
  }
}

/**
 * Wraps fetch to validate SERVER_MIN_CLIENT_HEADER on each response.
 */
export function createVersionAwareFetch(
  baseFetch: typeof fetch,
  options: VersionCheckOptions
): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set(CLIENT_VERSION_HEADER, options.clientVersion);
    if (options.methodMapHash) {
      headers.set(METHOD_MAP_HASH_HEADER, options.methodMapHash);
    }
    const response = await baseFetch(input, { ...init, headers });
    assertServerMinClient(
      response.headers.get(SERVER_MIN_CLIENT_HEADER),
      options
    );
    return response;
  }) as typeof fetch;
}

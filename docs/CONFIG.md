# Config reference (`react-native-proto.config`)

Put this file in **your app**, not inside the published package.

```ts
import type { ProtoClientConfig } from '@vishalsharma7nov/react-native-proto';
import {
  createAuthInterceptor,
  createLoggingInterceptor,
  createPathForMethod,
  ProtoSource,
} from '@vishalsharma7nov/react-native-proto';

const config: ProtoClientConfig = {
  baseUrl: 'https://api.example.com',
  protoSource: ProtoSource.local('protos'),
  pathPreset: 'connect',
  interceptors: [
    createAuthInterceptor({
      getAccessToken: () => localStorage.getItem('token'),
      refreshAccessToken: async () => refresh(),
    }),
    createLoggingInterceptor({ logRequestBody: false }),
  ],
};

export default config;
```

## Fields

| Field | Required | Default | Meaning |
|-------|----------|---------|---------|
| `baseUrl` | Yes | — | API origin (absolute URL) |
| `protoSource` | No | none | Where generate loads `.proto` files (local path, GitHub, or Buf). When omitted, generate fetches them from the project directory. Not used by `createApi` at request time. |
| `getHeaders` | No | none | Per-request headers |
| `timeoutMs` | No | `30000` | Request timeout |
| `maxResponseBytes` | No | `2 MiB` | Max response size |
| `transport` | No | `'http'` | `'http'` \| `'connect'` \| `'native-grpc'` |
| `fetch` | No | global `fetch` | Custom fetch |
| `onError` | No | none | Error hook (still throws) |
| `pathForMethod` | No | Connect-style path | Custom path builder |
| `pathPreset` | No | `'connect'` | Built-in preset if `pathForMethod` unset |
| `interceptors` | No | `[]` | Unary interceptor pipeline |
| `retryOnUnauthorized` | No | `true` | Transport-level 401 retry when no interceptors |

## Path presets

Use `pathPreset` or `createPathForMethod('restish' | 'envoy' | …)` / `pathFromTemplate('/v1/{serviceCamel}/{methodCamel}')`.

## Auth refresh

Prefer `createAuthInterceptor` over raw `getHeaders` when you need a single retry after token refresh.

## Version checks

Wrap fetch with `createVersionAwareFetch` or add `createVersionInterceptor` so the client sends `X-React-Native-Proto-Client-Version`.

## Transport choices

- **`http`** — POST binary protobuf (unary).
- **`connect`** — Connect unary + streaming envelopes.
- **`native-grpc`** — Native HTTP+protobuf unary via the linked module (or JS bridge override).

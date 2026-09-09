# Troubleshooting

## Cannot install from GitHub Packages

- Add `.npmrc` with the `@vishalsharma7nov` registry line
- Use a token with `read:packages`
- Or install from git: `npm install github:vishalsharma7nov/react-native-proto#v0.1.0`

## `baseUrl is required` / must be absolute URL

- Config must include `baseUrl: 'https://...'`
- Relative paths like `/api` are rejected

## `methodMap is empty`

- Your protos have no `service` / `rpc` blocks
- Run generate again after adding services

## `Native gRPC bridge is not installed`

- You set `transport: 'native-grpc'` without a native bridge
- Switch to `transport: 'http'` or install/link the native module

## Streaming errors on HTTP transport

- Streaming needs `connect` or `native-grpc`
- Default `http` is unary-only

## Metro / `.proto` imports

- Prefer `react-native-proto generate` for production
- Optional Metro helper: see `packages/react-native-proto/src/metro`

## 401 / 403 from API

- Check `getHeaders` Authorization value
- Confirm `baseUrl` points at the correct environment

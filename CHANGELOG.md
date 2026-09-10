# Changelog

## 0.2.4

### Added
- Message constructor helpers (`GetUserRequest({ id })`) and camelCase generated fields (dart_proto-style DX)
- Prefer `createApi()` for typed Request / Response method signatures

### Changed
- Example / web demos use `createApi`, `defaultCodecs`, and request constructors

## 0.2.3

### Added
- Package `README.md` so the npm package page shows documentation

## 0.2.2

### Changed
- Republish with npmjs Automation token support

## 0.2.1

### Fixed
- Republish after `0.2.0` was already on GitHub Packages (npm E409 on re-publish)

## 0.2.0

### Added
- Proto **watch** mode (`react-native-proto watch` / `npm run proto:watch`)
- **Buf / BSR** proto source (`--from buf --module … --ref …`, lock `source: "buf"`)
- Generated **`message-types.ts`** and typed **`create-api.ts`** (+ `--import-from` for apps)
- **Interceptors**, **auth** (token + refresh/401 retry), **logging** middleware
- **Offline mutation queue**
- **Path presets** / templates (`connect`, `envoy`, `grpc-gateway`, `restish`, custom)
- **Connect** error mapping + **server / client / bidi streaming** envelopes
- **Version compatibility** helpers (`createVersionAwareFetch`, headers)
- Optional **Zod** codec wrappers
- Node **mock server** (`@vishalsharma7nov/react-native-proto/mock-server`)
- Native HTTP+protobuf **unary** modules (iOS/Android) + Expo **config plugin**
- Web Vite example under `examples/web`
- Docs: bundle size guide

### Changed
- Package version `0.1.0` → `0.2.0`
- Transport config accepts `interceptors`, `pathPreset`

## 0.1.0

Initial release: generate/sync CLI, dynamic client, HTTP + basic Connect unary, React Query helpers, Metro `.proto` helper, docs, Expo example.

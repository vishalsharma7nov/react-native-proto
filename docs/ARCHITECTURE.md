# Architecture

This document explains how `@vishalsharma7nov/react-native-proto` is put together and how data moves from a `.proto` file to a working API call in your app.

## Big picture

```text
┌─────────────────────┐     ┌──────────────────────┐
│  Proto source       │     │  Your app            │
│  - local folder OR  │     │  react-native-proto  │
│  - GitHub repo      │     │  .config.ts          │
└─────────┬───────────┘     └──────────┬───────────┘
          │                            │
          ▼                            │
┌─────────────────────┐                │
│  CLI generate/sync  │                │
│  react-native-proto │                │
└─────────┬───────────┘                │
          │                            │
          ▼                            │
┌─────────────────────┐                │
│  Generated files    │                │
│  method-map +       │◄───────────────┘
│  message codecs     │   createClient(config)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Dynamic client     │  api.userService.getUser(...)
│  client-factory     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Transport          │  encode → HTTP/Connect/native → decode
│  + error mapping    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Your backend API   │
└─────────────────────┘
```

## Layers

### 1. Proto source

`.proto` files describe **messages** (data shapes) and **services** (RPC methods).

Configured in [`protos.lock.json`](../protos.lock.json):

| Mode | What happens |
|------|----------------|
| `local` | Read `.proto` files from a folder (example: `./vendor/protos`) |
| `github` | Clone a repo at a pinned `ref`, then read `.proto` files |

### 2. Code generation (build / maintainer time)

CLI: `npx react-native-proto generate` or `npm run sync:protos`

Produces (under `packages/react-native-proto/src/generated/` in this monorepo):

| Output | Role |
|--------|------|
| `method-map.ts` | List of services/methods, request/response type names, RPC path |
| `messages.pb.js` + `messages.ts` | Encode/decode helpers for each message type |

Apps that install the package can run the same CLI against **their own** protos and write output into their app (for example `./src/generated`).

### 3. App configuration (runtime)

File in **your app** (not inside `node_modules`):

`react-native-proto.config.ts`

Holds:

- `baseUrl` — API origin
- `getHeaders` — auth and other headers
- `transport` — `http` | `connect` | `native-grpc`
- timeouts / size limits

See [`CONFIG.md`](./CONFIG.md).

### 4. Client factory (runtime)

`createClient(config)` (or `createClientFromMap`) builds:

```ts
api.userService.getUser(...)
api.userService.addUser(...)
```

from the method map. There is **no hand-written networking code per RPC**. Every method goes through one shared call path.

Main files:

| File | Role |
|------|------|
| `src/client-factory.ts` | Builds `api.service.method` from the method map |
| `src/transport.ts` | Single unary HTTP/Connect call (encode, fetch, decode) |
| `src/streaming.ts` | Streaming helpers when transport supports it |
| `src/native-grpc/` | Optional native bridge for true gRPC on device |
| `src/errors.ts` | `ProtoClientError` and helpers |
| `src/index.ts` | Public package entry |

### 5. Transport to the server

Default path for an RPC:

```text
POST {baseUrl}/{package}.{Service}/{Method}
Body: protobuf bytes
```

Example:

```text
POST https://api.example.com/demo.UserService/GetUser
```

Override with `pathForMethod` in config if your gateway uses different URLs.

| Transport | Where it runs | Notes |
|-----------|---------------|--------|
| `http` | Mobile + web | Default; unary protobuf POST |
| `connect` | Mobile + web | Connect protocol headers |
| `native-grpc` | iOS/Android only | Needs native bridge; not for websites |

### 6. Errors

All failures are mapped to `ProtoClientError` (`TIMEOUT`, `NETWORK`, `HTTP`, `DECODE`, …).  
See [`ERRORS.md`](./ERRORS.md).

## Repository layout (this monorepo)

```text
/
  packages/react-native-proto/   # the publishable library
  example/                       # Expo demo app
  vendor/protos/                 # sample .proto files
  protos.lock.json               # where sync reads protos from
  docs/                          # documentation
  scripts/sync-protos.mjs        # runs CLI sync
  .github/workflows/             # CI, sync PRs, publish
```

More detail: [`FILE_GUIDE.md`](./FILE_GUIDE.md).

## Request lifecycle (one RPC call)

```text
1. App calls api.userService.getUser({ id: "1" })
2. Client looks up method map entry (request/response types, rpc path)
3. Codec encodes the request object → Uint8Array
4. Transport builds URL from baseUrl + pathForMethod
5. getHeaders() adds Authorization (and other headers)
6. fetch POST with protobuf body
7. Response bytes checked (status, max size)
8. Codec decodes bytes → JS object
9. On failure → ProtoClientError (never swallowed)
```

## What is dynamic vs what is generated

| Dynamic at runtime | Generated ahead of time |
|--------------------|-------------------------|
| `createClient` wiring methods from the map | Method list from `.proto` services |
| Headers, timeout, baseUrl from app config | Message encode/decode codecs |
| Transport choice (`http` / `connect` / …) | RPC path metadata |

Changing a `.proto` file does **not** update the package until you run generate/sync again.

## Related docs

- [`GETTING_STARTED.md`](./GETTING_STARTED.md) — first install and call
- [`GENERATE.md`](./GENERATE.md) — how to regenerate
- [`CONFIG.md`](./CONFIG.md) — app config fields
- [`FILE_GUIDE.md`](./FILE_GUIDE.md) — file-by-file map
- [`GLOSSARY.md`](./GLOSSARY.md) — terms

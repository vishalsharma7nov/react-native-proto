# File guide — which file is for which purpose

Use this page like a map. Start with the **Consumer app** section if you are setting up an app for the first time.

---

## In your React Native app (outside the package)

| Path | Purpose |
|------|---------|
| `react-native-proto.config.ts` | Your settings: API URL, auth headers, timeout, transport. **You create this.** |
| `src/generated/` | Output of `react-native-proto generate` when you generate from your own protos. **Do not edit by hand.** |
| `.npmrc` | Only needed to install from GitHub Packages (auth token). |
| Your screen / feature files | Call `api.service.method(...)`. Keep networking out of UI when possible. |

---

## In this library repository

| Path | Purpose |
|------|---------|
| `packages/react-native-proto/src/index.ts` | Public entry — what apps import (`createClient`, errors, types). |
| `packages/react-native-proto/src/proto-source.ts` | `ProtoSource` — local / GitHub / Buf proto location |
| `packages/react-native-proto/src/transport.ts` | Sends the request to the server and reads the response. |
| `packages/react-native-proto/src/errors.ts` | Error class and helpers (`ProtoClientError`, `isProtoClientError`). |
| `packages/react-native-proto/src/client-factory.ts` | Builds `api.userService.getUser` from the method map. |
| `packages/react-native-proto/src/streaming.ts` | Streaming RPC helpers (Connect / native). |
| `packages/react-native-proto/src/native-grpc/` | Bridge for real native gRPC when configured. |
| `packages/react-native-proto/src/codecs.ts` | Encode / decode helpers for protobuf messages. |
| `packages/react-native-proto/src/interceptors.ts` | Unary interceptor pipeline. |
| `packages/react-native-proto/src/auth.ts` | Bearer token + refresh interceptor. |
| `packages/react-native-proto/src/logging.ts` | Request/response logging interceptor. |
| `packages/react-native-proto/src/offline-queue.ts` | Offline mutation queue. |
| `packages/react-native-proto/src/path-templates.ts` | URL path presets / templates. |
| `packages/react-native-proto/src/version-check.ts` | Client/server version headers. |
| `packages/react-native-proto/src/validation/zod.ts` | Optional Zod codec wrappers. |
| `packages/react-native-proto/src/mock-server/` | Node mock server (import `/mock-server`). |
| `packages/react-native-proto/src/connect/` | Connect envelopes + error mapping. |
| `packages/react-native-proto/src/generated/` | Auto-generated method map, messages, types, create-api. **Do not edit by hand.** |
| `packages/react-native-proto/src/react-query/` | Optional React Query hooks. |
| `packages/react-native-proto/src/metro/` | Optional Metro helper for `.proto` files. |
| `packages/react-native-proto/bin/react-native-proto.js` | CLI: `generate`, `sync`, `watch`. |
| `packages/react-native-proto/app.plugin.js` | Expo config plugin. |
| `packages/react-native-proto/__tests__/` | Automated tests. |
| `vendor/protos/` | Sample / staged `.proto` files for local generate. |
| `protos.lock.json` | Where protos come from (`local`, `github`, or `buf`). `_…` keys are docs only. |
| `scripts/sync-protos.mjs` | Maintainer shortcut to run sync from the lock file. |
| `example/` | Expo sample app. |
| `examples/web/` | Vite browser example. |
| `examples/react-native-proto.config.example.ts` | Copy-paste config template for apps. |
| `docs/` | Documentation. See also `BUNDLE_SIZE.md`, `CHANGELOG.md` at repo root. |
| `.github/workflows/` | CI (test), proto sync PRs, publish. |
| `README.md` | Short overview and quick start. |

---

## What you should not edit

- Anything under `src/generated/` after a generate — it will be overwritten.
- Files inside `node_modules/@vishalsharma7nov/react-native-proto/` — changes are lost on reinstall. Put config in your app instead.

---

## Mental model

```text
Your .proto files  →  react-native-proto generate  →  method map + codecs
                                              ↓
Your react-native-proto.config.ts  →  createClient(config)  →  api.service.method()
                                              ↓
                                         Your backend
```

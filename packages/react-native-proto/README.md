# @vishalsharma7nov/react-native-proto

A React Native / TypeScript client for protobuf APIs.

Point it at your `.proto` files (local folder, GitHub, or Buf), generate typed client methods, and call your server:

```ts
const user = await api.userService.getUser({ id: '1' });
```

- **GitHub:** https://github.com/vishalsharma7nov/react-native-proto  
- **npm:** https://www.npmjs.com/package/@vishalsharma7nov/react-native-proto  
- **License:** MIT

---

## Install

```bash
npm install @vishalsharma7nov/react-native-proto
```

Or from GitHub Packages (add to `.npmrc`):

```ini
@vishalsharma7nov:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

---

## Quick start

### 1. Config (in your app, not in `node_modules`)

```ts
import type { ProtoClientConfig } from '@vishalsharma7nov/react-native-proto';
import { ProtoSource } from '@vishalsharma7nov/react-native-proto';

const config: ProtoClientConfig = {
  baseUrl: 'https://api.example.com',
  protoSource: ProtoSource.local('protos'),
  getHeaders: async () => ({
    Authorization: `Bearer ${await getToken()}`,
  }),
};

export default config;
```

### 2. Call your API

```ts
import { createClient, isProtoClientError } from '@vishalsharma7nov/react-native-proto';
import config from './react-native-proto.config';

const api = createClient(config);

try {
  const user = await api.userService.getUser({ id: '1' });
  console.log(user);
} catch (e) {
  if (isProtoClientError(e)) {
    console.error(e.code, e.message);
  }
}
```

---

## What you get

- Dynamic client from proto `service` / `rpc` definitions
- Typed `create-api.ts` + `message-types.ts` from generate
- Transports: HTTP + protobuf, Connect (unary + streaming), native HTTP/protobuf unary
- Interceptors (auth refresh, logging), offline queue, path presets, version headers
- Optional Zod validation wrappers
- CLI: `generate` / `sync` / `watch` (local, GitHub, or Buf)
- Optional React Query + Metro helpers
- Node mock server (`@vishalsharma7nov/react-native-proto/mock-server`)
- Expo config plugin

---

## Generate from your own protos

```bash
# Discover .proto files in the project (protos/, vendor/protos/, or cwd)
npx react-native-proto generate --out ./src/generated

# Local folder
npx react-native-proto generate --from local --path ./protos --out ./src/generated

# Watch local protos
npx react-native-proto watch --from local --path ./protos --out ./src/generated

# GitHub (pin a tag or commit)
npx react-native-proto generate --from github --repo https://github.com/you/protos.git --ref v1.0.0 --out ./src/generated

# Buf module
npx react-native-proto generate --from buf --module buf.build/acme/petapis --ref 1.0.0 --out ./src/generated

# App-local generate (import runtime from this package)
npx react-native-proto generate --from local --path ./protos --out ./src/generated \
  --import-from @vishalsharma7nov/react-native-proto
```

Your `.proto` files must include `service` and `rpc` blocks.

---

## Docs

Full documentation lives in the repo:

| Doc | What it explains |
|-----|------------------|
| [Getting started](https://github.com/vishalsharma7nov/react-native-proto/blob/master/docs/GETTING_STARTED.md) | Step-by-step setup |
| [Architecture](https://github.com/vishalsharma7nov/react-native-proto/blob/master/docs/ARCHITECTURE.md) | Layers and request flow |
| [Config](https://github.com/vishalsharma7nov/react-native-proto/blob/master/docs/CONFIG.md) | Config fields |
| [Generate](https://github.com/vishalsharma7nov/react-native-proto/blob/master/docs/GENERATE.md) | Local / GitHub / Buf generate |
| [Errors](https://github.com/vishalsharma7nov/react-native-proto/blob/master/docs/ERRORS.md) | Error codes |
| [Troubleshooting](https://github.com/vishalsharma7nov/react-native-proto/blob/master/docs/TROUBLESHOOTING.md) | Common problems |
| [Changelog](https://github.com/vishalsharma7nov/react-native-proto/blob/master/CHANGELOG.md) | Release notes |

---

## Example apps

- Expo demo: [`example/`](https://github.com/vishalsharma7nov/react-native-proto/tree/master/example)
- Vite web demo: [`examples/web/`](https://github.com/vishalsharma7nov/react-native-proto/tree/master/examples/web)

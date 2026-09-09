# @vishalsharma7nov/react-native-proto

A React Native / TypeScript client for protobuf APIs.

You point it at your `.proto` files (from **GitHub** or a **local folder**), generate typed client methods, and call your server with simple functions like:

```ts
const user = await api.userService.getUser({ id: '1' });
```

Package: **`@vishalsharma7nov/react-native-proto`**  
GitHub: **https://github.com/vishalsharma7nov/react-native-proto**

---

## What you get

- Dynamic client from proto `service` / `rpc` definitions
- Typed `create-api.ts` + `message-types.ts` from generate
- App config outside the package (`react-native-proto.config.ts`)
- Transports: **HTTP + protobuf**, **Connect** (unary + streaming), **native** HTTP/protobuf unary
- Interceptors (auth refresh, logging), offline queue, path presets, version headers
- Optional Zod validation wrappers
- CLI: `generate` / `sync` / `watch` (local, GitHub, or Buf)
- Optional React Query + Metro helpers
- Node mock server (`/mock-server`), Expo config plugin, web example
- Docs under [`docs/`](./docs) — see [`CHANGELOG.md`](./CHANGELOG.md) and [`docs/BUNDLE_SIZE.md`](./docs/BUNDLE_SIZE.md)

---

## 5-minute start

### 1. Install

**From GitHub Packages** (add `.npmrc` in your app):

```ini
@vishalsharma7nov:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

```bash
npm install @vishalsharma7nov/react-native-proto
```

**Or from git:**

```bash
npm install github:vishalsharma7nov/react-native-proto#v0.1.0
```

### 2. Add config in your app (not inside node_modules)

Create `react-native-proto.config.ts`:

```ts
import type { ProtoClientConfig } from '@vishalsharma7nov/react-native-proto';

const config: ProtoClientConfig = {
  baseUrl: 'https://api.example.com',
  getHeaders: async () => ({
    Authorization: `Bearer ${await getToken()}`,
  }),
};

export default config;
```

See also [`examples/react-native-proto.config.example.ts`](./examples/react-native-proto.config.example.ts).

### 3. Call your API

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

## Generate from your own protos

```bash
# Local folder
npx react-native-proto generate --from local --path ./protos --out ./src/generated

# Watch local protos
npx react-native-proto watch --from local --path ./protos --out ./src/generated

# GitHub (pin a tag or commit)
npx react-native-proto generate --from github --repo https://github.com/you/protos.git --ref v1.0.0 --out ./src/generated

# Buf module
npx react-native-proto generate --from buf --module buf.build/acme/petapis --ref 1.0.0 --out ./src/generated

# App-local generate (import runtime from the package)
npx react-native-proto generate --from local --path ./protos --out ./src/generated \
  --import-from @vishalsharma7nov/react-native-proto
```

Your `.proto` files must include `service` and `rpc` blocks for client methods to appear.

---

## Docs (start here if you are new)

| Doc | What it explains |
|-----|------------------|
| [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) | Step-by-step setup |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | How the system is designed (layers + flow) |
| [docs/FILE_GUIDE.md](./docs/FILE_GUIDE.md) | Which file is for which purpose |
| [docs/CONFIG.md](./docs/CONFIG.md) | Config fields |
| [docs/GENERATE.md](./docs/GENERATE.md) | GitHub vs local generate |
| [docs/ERRORS.md](./docs/ERRORS.md) | Error codes |
| [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Common problems |
| [docs/GLOSSARY.md](./docs/GLOSSARY.md) | Plain-language terms |

---

## Example app

See the [`example/`](./example) Expo app for a working demo.

---

## License

MIT

# Getting started

This guide uses plain language. You do not need to know protobuf deeply to follow it.

## 1. Install the package

In your React Native app folder:

```bash
npm install @vishalsharma7nov/react-native-proto
```

If you install from **GitHub Packages**, add a file named `.npmrc` in your app:

```ini
@vishalsharma7nov:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Create a GitHub token with `read:packages` permission.

## 2. Create a config file in your app

Create `react-native-proto.config.ts` **in your app** (next to your source code), not inside `node_modules`.

```ts
import type { ProtoClientConfig } from '@vishalsharma7nov/react-native-proto';
import { ProtoSource } from '@vishalsharma7nov/react-native-proto';

const config: ProtoClientConfig = {
  baseUrl: 'https://api.example.com',
  protoSource: ProtoSource.local('protos'),
};

export default config;
```

`baseUrl` is required. It must be a full URL starting with `https://` or `http://`.

## 3. Create the client and call a method

```ts
import { createClient } from '@vishalsharma7nov/react-native-proto';
import config from './react-native-proto.config';

const api = createClient(config);

// Example using the demo methods shipped with the package:
const user = await api.userService.getUser({ id: '1' });
```

## 4. Use your own .proto files (recommended)

If your backend has its own services:

```bash
npx react-native-proto generate --out ./src/generated
```

Pass `--path ./protos` (or `ProtoSource.local('protos')` on config) to pin a folder. Omit both to fetch `.proto` files from the project directory. GitHub/Buf: `ProtoSource.github` / `ProtoSource.buf`, or `--from github` / `--from buf`.

Or from GitHub:

```bash
npx react-native-proto generate --from github --repo https://github.com/you/your-protos.git --ref v1.0.0 --out ./src/generated
```

Then build a client with your generated map (advanced) or replace the package generated files when publishing your own fork.

## 5. Handle errors

```ts
import { isProtoClientError } from '@vishalsharma7nov/react-native-proto';

try {
  await api.userService.getUser({ id: '1' });
} catch (e) {
  if (isProtoClientError(e)) {
    console.log(e.code); // e.g. TIMEOUT, HTTP, NETWORK
  }
}
```

## Next reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) — how the system fits together
- [FILE_GUIDE.md](./FILE_GUIDE.md) — what each file is for
- [CONFIG.md](./CONFIG.md) — all config options
- [ERRORS.md](./ERRORS.md) — error codes
- [GLOSSARY.md](./GLOSSARY.md) — simple definitions

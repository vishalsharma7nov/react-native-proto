# Generate clients from .proto files

## Why generate?

Your `.proto` files describe messages and services. Generation turns `rpc GetUser` into a callable function like `api.userService.getUser(...)`.

## Outputs

| File | Role |
|------|------|
| `method-map.ts` | Service / RPC metadata |
| `messages.ts` (+ `messages.pb.js`) | Encode/decode codecs |
| `message-types.ts` | TypeScript interfaces for messages |
| `create-api.ts` | Typed `createApi(config)` drop-in |

Set the same location on app config as `ProtoClientConfig.protoSource` (see [CONFIG.md](./CONFIG.md)). The CLI flags below are what `generate` / `watch` actually read.

## Local folder

`--from` defaults to `local`. `--path` is optional: if you omit it, generate looks for `.proto` files in `protos/`, `proto/`, `vendor/protos/`, then the project directory.

```bash
npx react-native-proto generate --out ./src/generated
npx react-native-proto generate --from local --path ./protos --out ./src/generated
```

Matches:

```ts
protoSource: ProtoSource.local()           // discover in the project
protoSource: ProtoSource.local('protos')   // explicit folder
```

## Watch (local)

Regenerate when `.proto` files change:

```bash
npx react-native-proto watch --out ./src/generated
npx react-native-proto watch --from local --path ./protos --out ./src/generated
# or in this monorepo:
npm run proto:watch
```

## GitHub repo

Always pin a tag or commit (`--ref`). Optional `--path` is a subdirectory inside the clone.

```bash
npx react-native-proto generate \
  --from github \
  --repo https://github.com/you/your-protos.git \
  --ref v1.2.3 \
  --path protos \
  --out ./src/generated
```

Matches `ProtoSource.github({ repo: '...', ref: 'v1.2.3', path: 'protos' })`.

## Buf Schema Registry

Requires the [Buf CLI](https://buf.build/docs/installation).

```bash
npx react-native-proto generate --from buf \
  --module buf.build/acme/petapis \
  --ref 1.0.0 \
  --out ./src/generated
```

Matches `ProtoSource.buf({ module: 'buf.build/acme/petapis', ref: '1.0.0' })`.

## Consumer apps (`--import-from`)

Generate into your app and import runtime helpers from the published package:

```bash
npx react-native-proto generate \
  --from local \
  --path ./protos \
  --out ./src/generated \
  --import-from @vishalsharma7nov/react-native-proto
```

Then:

```ts
import { createApi } from './generated/create-api';
```

## Maintainer sync (this repo)

`protos.lock.json` — `source` may be `local`, `github`, or `buf`. Keys starting with `_` are docs only.

```bash
npm run sync:protos
```

## When to regenerate

- You added/removed an `rpc`
- You changed request/response message fields
- You bumped the proto repo / Buf module version

## Do not edit generated files

Regenerate instead of hand-editing outputs under `generated/`.

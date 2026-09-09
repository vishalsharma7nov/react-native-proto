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

## Local folder

```bash
npx react-native-proto generate --from local --path ./protos --out ./src/generated
```

## Watch (local)

Regenerate when `.proto` files change:

```bash
npx react-native-proto watch --from local --path ./protos --out ./src/generated
# or in this monorepo:
npm run proto:watch
```

## GitHub repo

Always pin a tag or commit (`--ref`).

```bash
npx react-native-proto generate \
  --from github \
  --repo https://github.com/you/your-protos.git \
  --ref v1.2.3 \
  --out ./src/generated
```

## Buf Schema Registry

Requires the [Buf CLI](https://buf.build/docs/installation).

```bash
npx react-native-proto generate \
  --from buf \
  --module buf.build/acme/petapis \
  --ref 1.0.0 \
  --out ./src/generated
```

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

# Bundle size & tree-shaking

`@vishalsharma7nov/react-native-proto` is designed so apps only pay for what they import.

## Keep the main entry lean

Import runtime pieces from the package root:

```ts
import { createClient, createAuthInterceptor } from '@vishalsharma7nov/react-native-proto';
```

Avoid pulling Node-only tooling into the app bundle:

```ts
// Node / tests only — do not import from React Native or Vite browser code
import { createMockServer } from '@vishalsharma7nov/react-native-proto/mock-server';
```

## Optional peers stay optional

| Import path | When to use |
|-------------|-------------|
| `@vishalsharma7nov/react-native-proto` | Core client |
| `.../react-query` | Only if `@tanstack/react-query` is installed |
| `.../metro` | Metro config / transformer (Node build tooling) |
| `.../mock-server` | Local Node mock (not for device bundles) |

Zod helpers live in the core package but only call `.parse` if you wrap codecs — the `zod` package is an optional peer and is not required at runtime unless you use `withZodValidation`.

## Generated codecs

`messages.pb.js` from `pbjs` can dominate size when many `.proto` files are included. Tips:

1. Generate only the services your app calls (split proto packages).
2. Prefer app-local `react-native-proto generate --out ./src/generated --import-from @vishalsharma7nov/react-native-proto` so unused messages stay out of the published library.
3. Metro / Vite tree-shaking cannot remove message types referenced by the dynamic codec registry — keep generated roots small.

## Transports

- `http` / `connect` use `fetch` (already in RN / browsers).
- `native-grpc` loads the native bridge only when that transport is selected (`import()`), so unused native code stays out of the JS path until needed.

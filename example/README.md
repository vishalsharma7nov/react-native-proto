# Example Expo app

This small app is a **learning demo** for `@vishalsharma7nov/react-native-proto`.

## What each file is for

| File | Purpose |
|------|---------|
| `App.tsx` | Root shell — safe-area provider and the home screen. |
| `src/screens/HomeScreen.tsx` | Screen layout only. |
| `src/hooks/useGetUserDemo.ts` | Calls `api.userService.getUser`. |
| `src/components/` | Button and result card. |
| `src/theme/` | Colors, spacing, typography. |
| `src/content/copy.ts` | Screen titles and labels. |
| `src/config/flags.ts` | `USE_MOCK_SERVER` and demo user data. |
| `src/api/client.ts` | `createClient(config)` (mock or live). |
| `src/api/mockFetch.ts` | Fake protobuf server used when mock mode is on. |
| `src/api/formatError.ts` | Turns `ProtoClientError` / unknown into a string. |
| `react-native-proto.config.ts` | **Your** API settings (URL, headers, transport). Lives in the app, not inside the npm package. |
| `index.js` | Expo entry — mounts `App`. Usually leave as-is. |
| `app.json` | Expo app name / bundle ids. |
| `package.json` | Example app dependencies. |

Also see the copy-paste templates outside this folder:

| File | Purpose |
|------|---------|
| `../examples/react-native-proto.config.example.ts` | Config template to copy into any new app |
| `../examples/npmrc.example` | `.npmrc` template for GitHub Packages install |

## What this demo teaches

1. Keep `react-native-proto.config.ts` **in the app**
2. Call `createClient(config)`
3. Call a generated method: `api.userService.getUser({ id: '1' })`
4. Handle errors with `isProtoClientError(e)`

## Run

From the monorepo root:

```bash
npm install
npm start -w react-native-proto-example
```

## What you should see

**Mock mode is ON by default** (`USE_MOCK_SERVER = true` in `src/config/flags.ts`).

When you tap **Call getUser**, you should see JSON like:

```json
{
  "id": "1",
  "name": "Ada Lovelace",
  "age": 36
}
```

That means encode → mock server → decode worked.

To call a real API:

1. In `src/config/flags.ts`, set `USE_MOCK_SERVER = false`
2. In `react-native-proto.config.ts`, set your real `baseUrl`
3. Reload the app and tap the button again

## Native gRPC note

For `transport: 'native-grpc'` you need an Expo **development build** (`npx expo prebuild` + custom native code). Expo Go cannot load custom native modules.

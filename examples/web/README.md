# Web example

Minimal Vite + TypeScript app that uses `@vishalsharma7nov/react-native-proto` in the browser with a mock `fetch`.

```bash
# from monorepo root
npm install
npm run build -w @vishalsharma7nov/react-native-proto
npm install -w react-native-proto-web-example
npm run dev -w react-native-proto-web-example
```

Open the Vite URL, click **Call getUser**, and confirm a decoded user JSON payload.

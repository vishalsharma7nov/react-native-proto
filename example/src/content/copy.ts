export const copy = {
  title: "react-native-proto example",
  button: "Call getUser",
  calling: "Calling api.userService.getUser...",
  mockIdle: "Tap the button — demo uses a mock server (no real network).",
  liveIdle:
    "Tap the button to call your real API from react-native-proto.config.ts.",
  mockHint:
    "Mock mode is ON. Set USE_MOCK_SERVER = false in src/config/flags.ts to use react-native-proto.config.ts.",
  liveHint: "Live mode. Edit react-native-proto.config.ts to point at your API.",
  missingMethod: "userService.getUser was not generated — check your protos",
} as const;

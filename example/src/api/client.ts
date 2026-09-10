import { createApi } from "@vishalsharma7nov/react-native-proto";
import type { ProtoClientConfig } from "@vishalsharma7nov/react-native-proto";
import appConfig from "../../react-native-proto.config";
import { USE_MOCK_SERVER } from "../config/flags";
import { createMockFetch } from "./mockFetch";

export function createDemoClient() {
  const config: ProtoClientConfig = USE_MOCK_SERVER
    ? {
        ...appConfig,
        baseUrl: "https://mock.local",
        fetch: createMockFetch(),
      }
    : appConfig;

  return createApi(config);
}

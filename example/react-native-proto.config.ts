/**
 * =============================================================================
 * APP CONFIG FILE (required for real API calls)
 * =============================================================================
 *
 * WHERE THIS FILE LIVES
 *   Keep this file in YOUR app (example/ or your project root area).
 *   Never put production URLs or secrets inside node_modules / the published
 *   package — those get overwritten on every install.
 *
 * HOW IT IS USED
 *   import config from './react-native-proto.config';
 *   const api = createClient(config);
 *
 * WHAT TO CHANGE
 *   1. baseUrl      → your real API origin
 *   2. getHeaders   → auth token / app headers (optional)
 *   3. transport    → usually leave as 'http' to start
 *
 * See also: docs/CONFIG.md and examples/react-native-proto.config.example.ts
 * =============================================================================
 */

import type { ProtoClientConfig } from '@vishalsharma7nov/react-native-proto';

const config: ProtoClientConfig = {
  /**
   * Required.
   * Full origin of your backend, for example:
   *   https://api.mycompany.com
   *
   * Must be absolute (include https://). Relative paths like "/api" are rejected.
   * Trailing slashes are fine; the client normalizes them.
   */
  baseUrl: 'https://api.example.com',

  /**
   * Optional.
   * How bytes are sent to the server:
   *   'http'         → POST binary protobuf (default, easiest to start)
   *   'connect'      → Connect protocol over HTTP
   *   'native-grpc'  → native iOS/Android gRPC bridge (needs native setup)
   */
  transport: 'http',

  /**
   * Optional.
   * Cancel the request if the server takes longer than this many milliseconds.
   * Default in the library is 30000 (30 seconds).
   */
  timeoutMs: 15_000,

  /**
   * Optional.
   * Called before every request. Return headers such as Authorization.
   * Can be async if you need to refresh a token first.
   *
   * Example for a real app:
   *   getHeaders: async () => ({
   *     Authorization: `Bearer ${await getAccessToken()}`,
   *   }),
   */
  getHeaders: () => ({
    'X-Demo-App': 'react-native-proto-example',
  }),
};

export default config;

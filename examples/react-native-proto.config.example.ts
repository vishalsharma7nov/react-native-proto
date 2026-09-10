/**
 * =============================================================================
 * COPY-PASTE CONFIG TEMPLATE FOR YOUR APP
 * =============================================================================
 *
 * How to use this file:
 *   1. Copy it into your React Native / Expo app (NOT into node_modules).
 *   2. Rename it to react-native-proto.config.ts (or keep any name you prefer).
 *   3. Replace the placeholder values below.
 *   4. Import it when creating the client:
 *
 *        import { createClient } from '@vishalsharma7nov/react-native-proto';
 *        import config from './react-native-proto.config';
 *        const api = createClient(config);
 *
 * More detail: docs/CONFIG.md and docs/GETTING_STARTED.md
 * =============================================================================
 */

import type { ProtoClientConfig } from '@vishalsharma7nov/react-native-proto';
import {
  ProtoSource,
  createAuthInterceptor,
  createLoggingInterceptor,
} from '@vishalsharma7nov/react-native-proto';

const config: ProtoClientConfig = {
  // ---------------------------------------------------------------------------
  // REQUIRED
  // ---------------------------------------------------------------------------

  /**
   * Your API origin (scheme + host, optional port).
   * Examples:
   *   https://api.example.com
   *   http://10.0.2.2:8080   (Android emulator → host machine)
   */
  baseUrl: 'https://api.example.com',

  // ---------------------------------------------------------------------------
  // OPTIONAL — where generate/sync loads .proto files
  // Omit protoSource (or use ProtoSource.local() with no path) to fetch
  // .proto files from this project: protos/, proto/, vendor/protos/, or cwd.
  // ---------------------------------------------------------------------------

  protoSource: ProtoSource.local('protos'),
  // protoSource: ProtoSource.github({
  //   repo: 'https://github.com/you/your-protos.git',
  //   ref: 'v1.2.3',
  //   path: 'protos',
  // }),
  // protoSource: ProtoSource.buf({
  //   module: 'buf.build/acme/petapis',
  //   ref: '1.0.0',
  // }),

  // ---------------------------------------------------------------------------
  // OPTIONAL — auth and other headers
  // ---------------------------------------------------------------------------

  /**
   * Runs before each RPC. Return a plain object of HTTP headers.
   * Or prefer createAuthInterceptor below for refresh/401 retry.
   */
  getHeaders: async () => ({
    Authorization: 'Bearer REPLACE_ME',
    'X-App-Version': '1.0.0',
  }),

  // ---------------------------------------------------------------------------
  // OPTIONAL — timeouts, size limits, transport, paths, interceptors
  // ---------------------------------------------------------------------------

  /** Abort the call after this many milliseconds (library default: 30000). */
  timeoutMs: 30_000,

  /** Reject responses larger than this many bytes (library default: 2 MiB). */
  maxResponseBytes: 2 * 1024 * 1024,

  /**
   * 'http'        → POST protobuf body (recommended starting point)
   * 'connect'     → Connect protocol (unary + streaming)
   * 'native-grpc' → native HTTP+protobuf unary module
   */
  transport: 'http',

  /** Built-in path style when pathForMethod is omitted */
  pathPreset: 'connect',

  interceptors: [
    createAuthInterceptor({
      getAccessToken: async () => 'REPLACE_ME',
      // refreshAccessToken: async () => refresh(),
    }),
    createLoggingInterceptor({ logRequestBody: false }),
  ],
};

export default config;

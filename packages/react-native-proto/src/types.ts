import type { Type } from 'protobufjs';
import type { Interceptor } from './interceptors';
import type { PathTemplatePreset } from './path-templates';
import type { ProtoSource } from './proto-source';

export type TransportKind = 'http' | 'connect' | 'native-grpc';

export type HeaderMap = Record<string, string>;

export type ProtoClientConfig = {
  /** API origin, for example https://api.example.com */
  baseUrl: string;
  /**
   * Where to load `.proto` files for generate/sync.
   *
   * Use `ProtoSource.local`, `ProtoSource.github`, or `ProtoSource.buf`.
   * When omitted, generate fetches `.proto` files from the project directory
   * (`protos/`, `vendor/protos/`, or the current directory).
   * Not used at request time by `createApi` / `createClient`.
   */
  protoSource?: ProtoSource;
  /** Optional per-request headers (auth tokens, app version, etc.) */
  getHeaders?: () => HeaderMap | Promise<HeaderMap>;
  /** Request timeout in milliseconds (default 30000) */
  timeoutMs?: number;
  /** Maximum accepted response body size in bytes (default 2 MiB) */
  maxResponseBytes?: number;
  /** How calls are sent to the server */
  transport?: TransportKind;
  /** Custom fetch implementation (tests / polyfills) */
  fetch?: typeof fetch;
  /** Optional logging hook — errors are still thrown */
  onError?: (error: import('./errors').ProtoClientError) => void;
  /**
   * Builds the HTTP path for a service method.
   * Default: /{package}.{Service}/{Method}
   */
  pathForMethod?: (entry: MethodMapEntry) => string;
  /** Shortcut for built-in path presets (ignored if pathForMethod is set) */
  pathPreset?: PathTemplatePreset;
  /** Unary interceptor pipeline (auth, logging, etc.) */
  interceptors?: Interceptor[];
  /**
   * When true (default), retry a unary call once after auth interceptor refresh
   * is handled inside createAuthInterceptor — this flag reserved for transport-level 401.
   */
  retryOnUnauthorized?: boolean;
};

export type MethodKind = 'unary' | 'serverStreaming' | 'clientStreaming' | 'bidi';

export type MethodMapEntry = {
  serviceName: string;
  methodName: string;
  packageName: string;
  rpcPath: string;
  requestType: string;
  responseType: string;
  kind: MethodKind;
};

export type MethodMap = ReadonlyArray<MethodMapEntry>;

export type MessageCodec = {
  encode: (message: Record<string, unknown>) => Uint8Array;
  decode: (bytes: Uint8Array) => Record<string, unknown>;
};

export type CodecRegistry = {
  get(typeName: string): MessageCodec | undefined;
  has(typeName: string): boolean;
};

export type UnaryCallInput = {
  entry: MethodMapEntry;
  request: Record<string, unknown>;
  signal?: AbortSignal;
  /** Extra headers merged for this call (from interceptors) */
  headers?: HeaderMap;
};

export type StreamCallInput = UnaryCallInput & {
  onMessage?: (message: Record<string, unknown>) => void;
  /** Client-streaming / bidi: async iterable of request messages */
  requests?: AsyncIterable<Record<string, unknown>> | Iterable<Record<string, unknown>>;
};

export type ClientServices = {
  [serviceName: string]: {
    [methodName: string]: (
      request?: Record<string, unknown>,
      options?: { signal?: AbortSignal }
    ) => Promise<Record<string, unknown>> | AsyncIterable<Record<string, unknown>>;
  };
};

export type ProtoClient = ClientServices & {
  readonly config: Readonly<Required<
    Pick<ProtoClientConfig, 'baseUrl' | 'timeoutMs' | 'maxResponseBytes' | 'transport'>
  >> &
    ProtoClientConfig;
};

export type ProtobufTypeLike = Pick<Type, 'encode' | 'decode' | 'create' | 'fromObject'>;

import { createClientFromMap } from "./client-factory";
import { getErrorCode, isProtoClientError, ProtoClientError } from "./errors";
import { methodMap } from "./generated/method-map";
import { defaultCodecs } from "./generated/messages";
import { isNativeGrpcAvailable } from "./native-grpc";
import type {
  CodecRegistry,
  MethodMap,
  ProtoClient,
  ProtoClientConfig,
} from "./types";

export type {
  CodecRegistry,
  HeaderMap,
  MethodKind,
  MethodMap,
  MethodMapEntry,
  ProtoClient,
  ProtoClientConfig,
  TransportKind,
} from "./types";
export { ProtoSource } from "./proto-source";
export type {
  BufProtoSource,
  GithubProtoSource,
  LocalProtoSource,
  ProtoSourceKind,
} from "./proto-source";

export type { CallContext, Interceptor, UnaryHandler } from "./interceptors";
export type { PathTemplatePreset } from "./path-templates";
export type { AuthInterceptorOptions } from "./auth";
export type { LoggingOptions } from "./logging";
export type { OfflineQueueOptions, QueuedMutation } from "./offline-queue";
export type { VersionCheckOptions } from "./version-check";
export type { ZodLikeSchema } from "./validation/zod";

export { getErrorCode, isProtoClientError, ProtoClientError };

export { createClientFromMap } from "./client-factory";
export { createCodecRegistry, codecFromType } from "./codecs";
export { composeInterceptors } from "./interceptors";
export { createAuthInterceptor, createBearerTokenHeaders } from "./auth";
export { createLoggingInterceptor } from "./logging";
export { OfflineMutationQueue } from "./offline-queue";
export { createPathForMethod, pathFromTemplate } from "./path-templates";
export {
  CLIENT_VERSION_HEADER,
  SERVER_MIN_CLIENT_HEADER,
  METHOD_MAP_HASH_HEADER,
  compareDottedVersions,
  versionHeaders,
  createVersionInterceptor,
  createVersionAwareFetch,
  assertServerMinClient,
} from "./version-check";
export { withZodValidation, wrapCodecRegistryWithZod } from "./validation/zod";
export {
  encodeConnectEnvelope,
  decodeConnectEnvelopes,
} from "./connect/envelope";
export { methodMap } from "./generated/method-map";
/** Protobufjs codecs keyed by proto type name (e.g. demo.User). */
export { defaultCodecs } from "./generated/messages";
export {
  isNativeGrpcAvailable,
  installNativeGrpcBridgeFromNativeModule,
} from "./native-grpc";

/** Typed API factory — methods take generated Request types (not Record). */
export {
  createApi,
  type GeneratedApi,
} from "./generated/create-api";
/** Message constructors + types (GetActiveProfileRequest({ latLng: LatLng({ ... }) })). */
export * from "./generated/message-types";
export type * from "./generated/create-api";

export type CreateClientOptions = ProtoClientConfig & {
  /** Override generated method map (advanced / tests) */
  methodMap?: MethodMap;
  /** Override message codecs (advanced / tests) */
  codecs?: CodecRegistry;
};

/**
 * Create a dynamic API client from package method metadata + your app config.
 * Prefer {@link createApi} when you want typed Request / Response shapes.
 *
 * @example
 * const api = createClient({
 *   baseUrl: 'https://api.example.com',
 *   getHeaders: () => ({ Authorization: `Bearer ${token}` }),
 * });
 * const user = await api.userService.getUser({ id: '1' });
 */
export function createClient(config: CreateClientOptions): ProtoClient {
  const map = config.methodMap ?? methodMap;
  const codecs = config.codecs ?? defaultCodecs;
  return createClientFromMap(config, map, codecs);
}

export function getDefaultMethodMap(): MethodMap {
  return methodMap;
}

export function getTransportCapabilities() {
  return {
    http: true,
    connect: true,
    connectStreaming: true,
    nativeGrpc: isNativeGrpcAvailable(),
    interceptors: true,
    mockServer: true,
  };
}

import { ProtoClientError } from './errors';
import { streamCall } from './streaming';
import { resolveConfig, unaryCall } from './transport';
import type {
  ClientServices,
  CodecRegistry,
  MethodMap,
  MethodMapEntry,
  ProtoClient,
  ProtoClientConfig,
} from './types';

const MAX_METHODS = 2_000;

function toCamelServiceName(serviceName: string): string {
  if (!serviceName) {
    return serviceName;
  }
  return serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
}

function assertMethodMap(methodMap: MethodMap): void {
  if (!Array.isArray(methodMap)) {
    throw new ProtoClientError({
      code: 'INVALID_CONFIG',
      message: 'methodMap must be an array',
    });
  }
  if (methodMap.length === 0) {
    throw new ProtoClientError({
      code: 'INVALID_CONFIG',
      message: 'methodMap is empty — generate from your .proto files first',
    });
  }
  if (methodMap.length > MAX_METHODS) {
    throw new ProtoClientError({
      code: 'INVALID_CONFIG',
      message: `methodMap exceeds max methods (${MAX_METHODS})`,
    });
  }
}

function createMethodHandler(
  entry: MethodMapEntry,
  config: ReturnType<typeof resolveConfig>,
  codecs: CodecRegistry
) {
  if (entry.kind === 'unary') {
    return async (
      request: Record<string, unknown> = {},
      options?: { signal?: AbortSignal }
    ) =>
      unaryCall(config, codecs, {
        entry,
        request,
        signal: options?.signal,
      });
  }

  return (
    request: Record<string, unknown> = {},
    options?: { signal?: AbortSignal }
  ) =>
    streamCall(config, codecs, {
      entry,
      request,
      signal: options?.signal,
    });
}

/**
 * Builds a dynamic client from a generated method map and message codecs.
 * Apps typically call `createClient(config)` which uses the package defaults.
 */
export function createClientFromMap(
  config: ProtoClientConfig,
  methodMap: MethodMap,
  codecs: CodecRegistry
): ProtoClient {
  const resolved = resolveConfig(config);
  assertMethodMap(methodMap);

  const services: ClientServices = {};

  for (let i = 0; i < methodMap.length; i += 1) {
    const entry = methodMap[i];
    if (!entry) {
      continue;
    }

    const serviceKey = toCamelServiceName(entry.serviceName);
    const existing = services[serviceKey] ?? {};
    const methodKey =
      entry.methodName.charAt(0).toLowerCase() + entry.methodName.slice(1);

    existing[methodKey] = createMethodHandler(entry, resolved, codecs);
    services[serviceKey] = existing;
  }

  return Object.assign(services, {
    config: {
      ...config,
      baseUrl: resolved.baseUrl,
      timeoutMs: resolved.timeoutMs,
      maxResponseBytes: resolved.maxResponseBytes,
      transport: resolved.transport,
    },
  }) as ProtoClient;
}

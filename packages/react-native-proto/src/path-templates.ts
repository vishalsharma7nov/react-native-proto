import type { MethodMapEntry } from './types';

export type PathTemplatePreset =
  | 'connect'
  | 'grpc-web'
  | 'envoy'
  | 'grpc-gateway'
  | 'restish';

function packagePrefix(entry: MethodMapEntry): string {
  return entry.packageName ? `${entry.packageName}.` : '';
}

function lowerFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

/**
 * Built-in path builders for common gateways and proxies.
 *
 * - connect / grpc-web / envoy: `/{package}.{Service}/{Method}`
 * - grpc-gateway: `/{package}.{Service}/{Method}` (HTTP body RPC style)
 * - restish: `/v1/{service}/{method}` (lowercase camel segments)
 */
export function createPathForMethod(
  preset: PathTemplatePreset = 'connect'
): (entry: MethodMapEntry) => string {
  switch (preset) {
    case 'restish':
      return (entry) =>
        `/v1/${lowerFirst(entry.serviceName)}/${lowerFirst(entry.methodName)}`;
    case 'grpc-gateway':
    case 'connect':
    case 'grpc-web':
    case 'envoy':
    default:
      return (entry) =>
        `/${packagePrefix(entry)}${entry.serviceName}/${entry.methodName}`;
  }
}

/**
 * Custom template. Placeholders:
 * `{package}` `{service}` `{method}` `{rpcPath}`
 * `{serviceCamel}` `{methodCamel}`
 */
export function pathFromTemplate(
  template: string
): (entry: MethodMapEntry) => string {
  return (entry) =>
    template
      .split('{package}')
      .join(entry.packageName)
      .split('{service}')
      .join(entry.serviceName)
      .split('{method}')
      .join(entry.methodName)
      .split('{rpcPath}')
      .join(entry.rpcPath)
      .split('{serviceCamel}')
      .join(lowerFirst(entry.serviceName))
      .split('{methodCamel}')
      .join(lowerFirst(entry.methodName));
}

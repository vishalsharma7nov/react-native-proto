/**
 * Metro helper: treat .proto files as raw text assets for tooling/debug.
 * Prefer `react-native-proto generate` for production clients.
 */
export function createProtoMetroConfig(baseConfig: {
  resolver?: { sourceExts?: string[]; assetExts?: string[] };
  transformer?: { babelTransformerPath?: string };
}): typeof baseConfig {
  const resolver = baseConfig.resolver ?? {};
  const sourceExts = new Set([...(resolver.sourceExts ?? []), 'proto']);
  const assetExts = (resolver.assetExts ?? []).filter((ext) => ext !== 'proto');

  return {
    ...baseConfig,
    resolver: {
      ...resolver,
      sourceExts: Array.from(sourceExts),
      assetExts,
    },
    transformer: {
      ...baseConfig.transformer,
      babelTransformerPath: require.resolve('./transformer'),
    },
  };
}

export { transform } from './transformer';

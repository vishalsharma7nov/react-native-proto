/**
 * Metro config helper (CommonJS entry for metro.config.js).
 */
function createProtoMetroConfig(baseConfig) {
  const resolver = baseConfig.resolver || {};
  const sourceExts = new Set([...(resolver.sourceExts || []), 'proto']);
  const assetExts = (resolver.assetExts || []).filter((ext) => ext !== 'proto');

  return {
    ...baseConfig,
    resolver: {
      ...resolver,
      sourceExts: Array.from(sourceExts),
      assetExts,
    },
    transformer: {
      ...(baseConfig.transformer || {}),
      babelTransformerPath: require.resolve('./transformer'),
    },
  };
}

module.exports = { createProtoMetroConfig };

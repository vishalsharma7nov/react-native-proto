async function transform(args) {
  const { filename, src } = args;

  if (!filename.endsWith('.proto')) {
    try {
      const upstream = require('@react-native/metro-babel-transformer');
      if (upstream && typeof upstream.transform === 'function') {
        return upstream.transform(args);
      }
    } catch (_err) {
      // fall through
    }
  }

  return {
    code: `module.exports = ${JSON.stringify(src)};`,
    map: null,
  };
}

module.exports = { transform };

type TransformArgs = {
  filename: string;
  src: string;
  options?: Record<string, unknown>;
};

type TransformResult = {
  code: string;
  map?: null;
};

/**
 * Minimal Metro transformer for .proto files.
 * Non-proto files fall through to the upstream Babel transformer when present.
 */
export async function transform(
  args: TransformArgs
): Promise<TransformResult> {
  const { filename, src } = args;

  if (!filename.endsWith('.proto')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const upstream = require('@react-native/metro-babel-transformer');
      if (upstream && typeof upstream.transform === 'function') {
        return upstream.transform(args);
      }
    } catch {
      // Fall through to identity JS export of source text
    }
  }

  const escaped = JSON.stringify(src);
  return {
    code: `module.exports = ${escaped};`,
    map: null,
  };
}

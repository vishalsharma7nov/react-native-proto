/** Where `.proto` files are loaded from for `react-native-proto generate` / `sync`. */
export type ProtoSourceKind = 'local' | 'github' | 'buf';

export type LocalProtoSource = {
  kind: 'local';
  /** Local folder. Omit to discover `.proto` files in the project. */
  path?: string;
};

export type GithubProtoSource = {
  kind: 'github';
  repo: string;
  ref: string;
  /** Optional subdirectory inside the cloned repo. */
  path?: string;
};

export type BufProtoSource = {
  kind: 'buf';
  module: string;
  ref: string;
};

/**
 * Proto file location: a local folder, a GitHub repo, or a Buf module.
 *
 * Set this on `ProtoClientConfig.protoSource`. When omitted (or
 * `ProtoSource.local()` with no path), generate looks for `.proto` files in
 * the project directory (`protos/`, `proto/`, `vendor/protos/`, then cwd).
 *
 * This field is not used at request time by `createApi` / `createClient`.
 */
export type ProtoSource = LocalProtoSource | GithubProtoSource | BufProtoSource;

export const ProtoSource = {
  /** Local directory. Omit `path` to discover protos in the project. */
  local(path?: string): LocalProtoSource {
    return path === undefined ? { kind: 'local' } : { kind: 'local', path };
  },

  /** Clone `repo` at `ref`. Optional `path` is a subdirectory inside the repo. */
  github(options: {
    repo: string;
    ref: string;
    path?: string;
  }): GithubProtoSource {
    return { kind: 'github', ...options };
  },

  /** Export `module` at `ref` via the Buf CLI. */
  buf(options: { module: string; ref: string }): BufProtoSource {
    return { kind: 'buf', ...options };
  },
};

#!/usr/bin/env node
'use strict';

/**
 * react-native-proto CLI — generate clients from GitHub, Buf, or local .proto files.
 * Usage:
 *   react-native-proto generate --from local --path ./protos --out ./src/generated
 *   react-native-proto generate --from github --repo https://github.com/org/protos.git --ref v1.0.0 --out ./src/generated
 *   react-native-proto generate --from buf --module buf.build/owner/name --ref v1.0.0 --out ./src/generated
 *   react-native-proto generate --from local --path ./protos --out ./src/generated --import-from @vishalsharma7nov/react-native-proto
 *   react-native-proto sync   (reads protos.lock.json from cwd)
 *   react-native-proto watch  (local proto dir; lock or same flags as generate)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const MAX_PROTO_FILES = 500;
const WATCH_DEBOUNCE_MS = 300;

class CliError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.name = 'CliError';
    this.code = code;
  }
}

function printHelp() {
  console.log(`react-native-proto — React Native protobuf tooling

Commands:
  generate   Generate method-map, messages, message-types, create-api from .proto files
  sync       Read protos.lock.json and generate
  watch      Watch a local proto directory and re-generate on changes
  help       Show this help

Options for generate / watch:
  --from local|github|buf
  --path <dir>           Local proto directory (local)
  --repo <git-url>       Git repository URL (github)
  --module <buf-module>  Buf module, e.g. buf.build/owner/name (buf)
  --ref <tag|commit|ver> Git ref (github) or Buf version (buf)
  --out <dir>            Output directory (default: ./src/generated)
  --import-from <pkg>    Consumer mode: import runtime helpers from this package
                         (e.g. @vishalsharma7nov/react-native-proto)
  --help, -h

Examples:
  react-native-proto generate --from local --path ./vendor/protos --out ./src/generated
  react-native-proto generate --from buf --module buf.build/acme/petapis --ref 1.0.0 --out ./src/generated
  react-native-proto generate --from local --path ./protos --out ./src/api/generated --import-from @vishalsharma7nov/react-native-proto
  react-native-proto sync
  react-native-proto watch
  react-native-proto watch --from local --path ./vendor/protos --out ./src/generated
`);
}

function fail(message, code = 1) {
  throw new CliError(message, code);
}

function emptyArgs() {
  return {
    command: '',
    from: '',
    path: '',
    repo: '',
    module: '',
    ref: '',
    out: './src/generated',
    importFrom: '',
  };
}

function parseArgs(argv) {
  const args = emptyArgs();

  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  args.command = argv[0] || '';
  if (args.command === 'help') {
    printHelp();
    process.exit(0);
  }

  for (let i = 1; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === '--from' && next) {
      args.from = next;
      i += 1;
    } else if (token === '--path' && next) {
      args.path = next;
      i += 1;
    } else if (token === '--repo' && next) {
      args.repo = next;
      i += 1;
    } else if (token === '--module' && next) {
      args.module = next;
      i += 1;
    } else if (token === '--ref' && next) {
      args.ref = next;
      i += 1;
    } else if (token === '--out' && next) {
      args.out = next;
      i += 1;
    } else if (token === '--import-from' && next) {
      args.importFrom = next;
      i += 1;
    } else {
      fail(`Unknown or incomplete argument: ${token}`);
    }
  }
  return args;
}

function stripProtoComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function listProtoFiles(dir) {
  const absolute = path.resolve(dir);
  if (!fs.existsSync(absolute)) {
    fail(`Proto path does not exist: ${absolute}`);
  }

  const results = [];

  function walk(current) {
    if (results.length >= MAX_PROTO_FILES) {
      fail(`Too many .proto files (max ${MAX_PROTO_FILES})`);
    }
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (!entry) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.proto')) {
        results.push(full);
      }
    }
  }

  walk(absolute);
  if (results.length === 0) {
    fail(`No .proto files found under ${absolute}`);
  }
  return results;
}

function stageFromGithub(repo, ref) {
  if (!repo) fail('--repo is required when --from github');
  if (!ref) fail('--ref is required when --from github (pin a tag or commit)');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'react-native-proto-'));
  const target = path.join(tmp, 'protos');
  const clone = spawnSync(
    'git',
    ['clone', '--depth', '1', '--branch', ref, repo, target],
    { encoding: 'utf8' }
  );

  if (clone.status !== 0) {
    // fallback: clone default then checkout ref (for commit SHAs)
    const clone2 = spawnSync('git', ['clone', repo, target], { encoding: 'utf8' });
    if (clone2.status !== 0) {
      fail(`git clone failed: ${clone.stderr || clone2.stderr}`);
    }
    const checkout = spawnSync('git', ['checkout', ref], {
      cwd: target,
      encoding: 'utf8',
    });
    if (checkout.status !== 0) {
      fail(`git checkout ${ref} failed: ${checkout.stderr}`);
    }
  }

  return target;
}

function stageFromBuf(moduleName, ref) {
  if (!moduleName) fail('--module is required when --from buf');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'react-native-proto-buf-'));
  const moduleRef =
    ref && !moduleName.includes(':') ? `${moduleName}:${ref}` : moduleName;

  const exportArgs = ['export', moduleRef, '--output', tmp];

  let result = spawnSync('npx', ['--no-install', 'buf', ...exportArgs], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    result = spawnSync('buf', exportArgs, { encoding: 'utf8' });
  }

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    const notFound =
      result.error ||
      /not found|ENOENT|command not found/i.test(detail) ||
      (result.status === 127);

    if (notFound || (!detail && result.status !== 0)) {
      // Prefer install guidance when the CLI itself is missing
      const probe = spawnSync('buf', ['--version'], { encoding: 'utf8' });
      const npxProbe = spawnSync('npx', ['--no-install', 'buf', '--version'], {
        encoding: 'utf8',
      });
      if (probe.status !== 0 && npxProbe.status !== 0) {
        fail(
          'buf CLI not found. Install Buf (https://buf.build/docs/installation) and ensure `buf` is on PATH, or add it as a local dependency so `npx --no-install buf` works.'
        );
      }
    }

    fail(
      [
        `buf export failed for "${moduleRef}".`,
        detail ? `Details: ${detail}` : null,
      ]
        .filter(Boolean)
        .join(' ')
    );
  }

  return tmp;
}

function parseProtoServices(fileContent, filePath) {
  const methods = [];
  let packageName = '';
  const packageMatch = fileContent.match(/package\s+([A-Za-z0-9_.]+)\s*;/);
  if (packageMatch) {
    packageName = packageMatch[1];
  }

  const cleaned = stripProtoComments(fileContent);
  const serviceRegex = /service\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let serviceMatch = serviceRegex.exec(cleaned);
  while (serviceMatch) {
    const serviceName = serviceMatch[1];
    const body = serviceMatch[2] || '';
    const rpcRegex =
      /rpc\s+(\w+)\s*\(\s*(stream\s+)?([\w.]+)\s*\)\s*returns\s*\(\s*(stream\s+)?([\w.]+)\s*\)\s*;/g;
    let rpcMatch = rpcRegex.exec(body);
    while (rpcMatch) {
      const methodName = rpcMatch[1];
      const clientStream = Boolean(rpcMatch[2]);
      const requestTypeRaw = rpcMatch[3];
      const serverStream = Boolean(rpcMatch[4]);
      const responseTypeRaw = rpcMatch[5];

      let kind = 'unary';
      if (clientStream && serverStream) kind = 'bidi';
      else if (clientStream) kind = 'clientStreaming';
      else if (serverStream) kind = 'serverStreaming';

      const qualify = (name) => {
        if (name.includes('.')) return name;
        return packageName ? `${packageName}.${name}` : name;
      };

      methods.push({
        serviceName,
        methodName,
        packageName,
        rpcPath: `${packageName ? `${packageName}.` : ''}${serviceName}/${methodName}`,
        requestType: qualify(requestTypeRaw),
        responseType: qualify(responseTypeRaw),
        kind,
        source: filePath,
      });

      rpcMatch = rpcRegex.exec(body);
    }
    serviceMatch = serviceRegex.exec(cleaned);
  }

  return methods;
}

const SCALAR_TO_TS = {
  double: 'number',
  float: 'number',
  int32: 'number',
  int64: 'number',
  uint32: 'number',
  uint64: 'number',
  sint32: 'number',
  sint64: 'number',
  fixed32: 'number',
  fixed64: 'number',
  sfixed32: 'number',
  sfixed64: 'number',
  bool: 'boolean',
  string: 'string',
  bytes: 'Uint8Array',
};

function protoTypeToTs(typeName) {
  if (SCALAR_TO_TS[typeName]) {
    return SCALAR_TO_TS[typeName];
  }
  // message / enum reference — use simple type name (last segment)
  const parts = typeName.split('.');
  return parts[parts.length - 1];
}

function simpleTypeName(qualified) {
  const parts = String(qualified).split('.');
  return parts[parts.length - 1];
}

/**
 * Simple regex parser for `message Name { fields }` including repeated and map.
 */
function parseProtoMessages(fileContent) {
  const messages = [];
  const cleaned = stripProtoComments(fileContent);

  let packageName = '';
  const packageMatch = cleaned.match(/package\s+([A-Za-z0-9_.]+)\s*;/);
  if (packageMatch) {
    packageName = packageMatch[1];
  }

  const messageRegex = /message\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let messageMatch = messageRegex.exec(cleaned);
  while (messageMatch) {
    const name = messageMatch[1];
    const body = messageMatch[2] || '';
    const fields = [];

    const mapRegex =
      /(?:repeated\s+|optional\s+|required\s+)?map\s*<\s*([\w.]+)\s*,\s*([\w.]+)\s*>\s+(\w+)\s*=\s*\d+\s*;/g;
    let mapMatch = mapRegex.exec(body);
    const mapFieldNames = new Set();
    while (mapMatch) {
      const keyTs = protoTypeToTs(mapMatch[1]);
      const valueTs = protoTypeToTs(mapMatch[2]);
      const fieldName = mapMatch[3];
      mapFieldNames.add(fieldName);
      fields.push({
        name: fieldName,
        tsType: `Record<${keyTs}, ${valueTs}>`,
      });
      mapMatch = mapRegex.exec(body);
    }

    const fieldRegex =
      /(repeated|optional|required)?\s*([\w.]+)\s+(\w+)\s*=\s*\d+\s*;/g;
    let fieldMatch = fieldRegex.exec(body);
    while (fieldMatch) {
      const label = fieldMatch[1] || '';
      const typeName = fieldMatch[2];
      const fieldName = fieldMatch[3];
      if (mapFieldNames.has(fieldName)) {
        fieldMatch = fieldRegex.exec(body);
        continue;
      }
      // Skip nested message/enum declarations mistaken as fields
      if (typeName === 'message' || typeName === 'enum' || typeName === 'oneof') {
        fieldMatch = fieldRegex.exec(body);
        continue;
      }
      let tsType = protoTypeToTs(typeName);
      if (label === 'repeated') {
        tsType = `${tsType}[]`;
      }
      fields.push({ name: fieldName, tsType });
      fieldMatch = fieldRegex.exec(body);
    }

    messages.push({
      name,
      packageName,
      fullName: packageName ? `${packageName}.${name}` : name,
      fields,
    });

    messageMatch = messageRegex.exec(cleaned);
  }

  return messages;
}

function toCamelCase(name) {
  if (!name) return name;
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function resolveImportPaths(importFrom) {
  if (importFrom) {
    return {
      methodMapType: `import type { MethodMap } from '${importFrom}';`,
      codecsImport: `import { createCodecRegistry } from '${importFrom}';`,
      createApiImports: `import { createClientFromMap } from '${importFrom}';\nimport type { ProtoClientConfig } from '${importFrom}';`,
    };
  }
  return {
    methodMapType: `import type { MethodMap } from '../types';`,
    codecsImport: `import { createCodecRegistry } from '../codecs';`,
    createApiImports: `import { createClientFromMap } from '../client-factory';\nimport type { ProtoClientConfig } from '../types';`,
  };
}

function writeMessageTypes(outDir, messages) {
  const lines = [
    '/**',
    ' * Auto-generated TypeScript message types. Do not edit by hand.',
    ' * Parsed from .proto message field definitions (simple regex parser).',
    ' */',
    '',
  ];

  // Deduplicate by simple name (last wins if conflicts)
  const byName = new Map();
  for (let i = 0; i < messages.length; i += 1) {
    byName.set(messages[i].name, messages[i]);
  }

  const sorted = Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  for (let i = 0; i < sorted.length; i += 1) {
    const msg = sorted[i];
    lines.push(`export type ${msg.name} = {`);
    for (let j = 0; j < msg.fields.length; j += 1) {
      const field = msg.fields[j];
      lines.push(`  ${field.name}?: ${field.tsType};`);
    }
    lines.push('};');
    lines.push('');
  }

  fs.writeFileSync(path.join(outDir, 'message-types.ts'), lines.join('\n'), 'utf8');
}

function writeCreateApi(outDir, methods, messages, importFrom) {
  const imports = resolveImportPaths(importFrom);
  const messageNames = Array.from(
    new Set(messages.map((m) => m.name))
  ).sort();

  // Group methods by service
  const byService = new Map();
  for (let i = 0; i < methods.length; i += 1) {
    const m = methods[i];
    const list = byService.get(m.serviceName) || [];
    list.push(m);
    byService.set(m.serviceName, list);
  }

  const typeImport =
    messageNames.length > 0
      ? `import type {\n  ${messageNames.join(',\n  ')},\n} from './message-types';\n`
      : '';

  const lines = [
    '/**',
    ' * Auto-generated typed API factory. Do not edit by hand.',
    ' */',
    imports.createApiImports,
    `import { methodMap } from './method-map';`,
    `import { defaultCodecs } from './messages';`,
    typeImport,
  ];

  const serviceInterfaceNames = [];
  const serviceEntries = Array.from(byService.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (let i = 0; i < serviceEntries.length; i += 1) {
    const [serviceName, serviceMethods] = serviceEntries[i];
    const iface = `${serviceName}Api`;
    serviceInterfaceNames.push({
      serviceName,
      camel: toCamelCase(serviceName),
      iface,
    });

    lines.push(`export type ${iface} = {`);
    for (let j = 0; j < serviceMethods.length; j += 1) {
      const m = serviceMethods[j];
      const methodKey = toCamelCase(m.methodName);
      const req = simpleTypeName(m.requestType);
      const res = simpleTypeName(m.responseType);
      if (m.kind === 'unary') {
        lines.push(
          `  ${methodKey}: (request?: ${req}, options?: { signal?: AbortSignal }) => Promise<${res}>;`
        );
      } else {
        lines.push(
          `  ${methodKey}: (request?: ${req}, options?: { signal?: AbortSignal }) => AsyncIterable<${res}>;`
        );
      }
    }
    lines.push('};');
    lines.push('');
  }

  lines.push('export type GeneratedApi = {');
  for (let i = 0; i < serviceInterfaceNames.length; i += 1) {
    const s = serviceInterfaceNames[i];
    lines.push(`  ${s.camel}: ${s.iface};`);
  }
  lines.push('  readonly config: ProtoClientConfig;');
  lines.push('};');
  lines.push('');
  lines.push(
    'export function createApi(config: ProtoClientConfig): GeneratedApi {'
  );
  lines.push(
    '  return createClientFromMap(config, methodMap, defaultCodecs) as unknown as GeneratedApi;'
  );
  lines.push('}');
  lines.push('');
  lines.push('export { methodMap, defaultCodecs };');
  lines.push('');

  fs.writeFileSync(path.join(outDir, 'create-api.ts'), lines.join('\n'), 'utf8');
}

function pbAccessPath(fullName) {
  const parts = String(fullName).split('.').filter(Boolean);
  if (parts.length === 0) return 'pb';
  return `pb${parts.map((p) => `?.${p}`).join('')}`;
}

function writeGenerated(outDir, protoFiles, methods, messages, importFrom) {
  fs.mkdirSync(outDir, { recursive: true });

  const paths = resolveImportPaths(importFrom);

  const methodMapSource = `${paths.methodMapType}

/**
 * Auto-generated method map. Do not edit by hand.
 * Sources: ${protoFiles.map((f) => path.basename(f)).join(', ')}
 */
export const methodMap: MethodMap = ${JSON.stringify(
    methods.map(({ source, ...rest }) => rest),
    null,
    2
  )};
`;

  fs.writeFileSync(path.join(outDir, 'method-map.ts'), methodMapSource, 'utf8');

  writeMessageTypes(outDir, messages);
  writeCreateApi(outDir, methods, messages, importFrom);

  // Prefer pbjs when available for full message codecs
  let pbjsBin = null;
  try {
    const cliRoot = path.dirname(require.resolve('protobufjs-cli/package.json'));
    const candidate = path.join(cliRoot, 'bin', 'pbjs');
    if (fs.existsSync(candidate)) {
      pbjsBin = candidate;
    }
  } catch (_err) {
    // fall through
  }
  if (!pbjsBin) {
    const probe = spawnSync('npx', ['--no-install', 'pbjs', '-h'], {
      encoding: 'utf8',
    });
    if (probe.status === 0) {
      pbjsBin = 'pbjs';
    }
  }

  const messagesJs = path.join(outDir, 'messages.pb.js');
  const relativeProtos = protoFiles;

  if (pbjsBin) {
    const pbjsArgs = [
      '-t',
      'static-module',
      '-w',
      'commonjs',
      '-o',
      messagesJs,
      ...relativeProtos,
    ];
    const useNpx = pbjsBin === 'pbjs';
    const result = spawnSync(
      useNpx ? 'npx' : process.execPath,
      useNpx ? ['--no-install', 'pbjs', ...pbjsArgs] : [pbjsBin, ...pbjsArgs],
      { encoding: 'utf8' }
    );
    if (result.status !== 0) {
      console.warn(
        'react-native-proto: pbjs failed; writing descriptor stub. Details:',
        result.stderr || result.stdout
      );
      writeMessagesStub(outDir, methods, importFrom);
    } else {
      writeMessagesWrapper(outDir, messages, importFrom);
    }
  } else {
    writeMessagesStub(outDir, methods, importFrom);
  }

  console.log(
    `react-native-proto: generated ${methods.length} methods → ${path.resolve(outDir)}`
  );
  console.log(
    `react-native-proto: wrote method-map.ts, messages.ts, message-types.ts, create-api.ts`
  );
}

function writeMessagesWrapper(outDir, messages, importFrom) {
  const paths = resolveImportPaths(importFrom);

  // Deduplicate message names for exports
  const byName = new Map();
  for (let i = 0; i < (messages || []).length; i += 1) {
    byName.set(messages[i].name, messages[i]);
  }
  const sorted = Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Message TypeScript shapes live in message-types.ts only.
  // This file exports protobufjs Type codecs with the same names (values).

  const namedExports = sorted
    .map((m) => {
      const access = pbAccessPath(m.fullName);
      return `export const ${m.name} = ${access} as Type;`;
    })
    .join('\n');

  // Also export top-level package namespaces when present
  const packages = Array.from(
    new Set(sorted.map((m) => m.packageName).filter(Boolean))
  );
  const packageExports = packages
    .map((pkg) => {
      const root = pkg.split('.')[0];
      return `export const ${root} = pb.${root};`;
    })
    .join('\n');

  const wrapper = `/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import type { Type } from 'protobufjs';
${paths.codecsImport}
// Auto-generated wrapper. Do not edit by hand.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pb = require('./messages.pb.js');

function isType(value: unknown): value is Type {
  if (!value) return false;
  if (typeof value !== 'object' && typeof value !== 'function') return false;
  return typeof (value as Type).encode === 'function' && typeof (value as Type).decode === 'function';
}

function collectTypes(obj: any, prefix = '', acc: Record<string, Type> = {}) {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return acc;
  if (isType(obj) && prefix) acc[prefix] = obj;
  for (const key of Object.keys(obj)) {
    if (['encode','decode','create','fromObject','toObject','encodeDelimited','decodeDelimited','verify','getTypeUrl'].includes(key)) continue;
    const next = obj[key];
    const nextPrefix = prefix ? \`\${prefix}.\${key}\` : key;
    if (isType(next)) {
      acc[nextPrefix] = next;
      continue;
    }
    if (next && typeof next === 'object') collectTypes(next, nextPrefix, acc);
  }
  return acc;
}

export const messageTypes = collectTypes(pb);
export const defaultCodecs = createCodecRegistry(messageTypes);

${packageExports}
${namedExports}

export default pb;
`;
  fs.writeFileSync(path.join(outDir, 'messages.ts'), wrapper, 'utf8');
}

function writeMessagesStub(outDir, methods, importFrom) {
  const paths = resolveImportPaths(importFrom);
  const typeNames = Array.from(
    new Set(methods.flatMap((m) => [m.requestType, m.responseType]))
  );
  const stub = `import protobuf from 'protobufjs';
${paths.codecsImport}

/**
 * Stub registry. Run with protobufjs-cli (pbjs) available for full codecs.
 * Types referenced: ${typeNames.join(', ')}
 */
const root = new protobuf.Root();
export const messageTypes: Record<string, protobuf.Type> = {};
export const defaultCodecs = createCodecRegistry(messageTypes);
export { root };
`;
  fs.writeFileSync(path.join(outDir, 'messages.ts'), stub, 'utf8');
}

function resolveProtoRoot(args) {
  if (args.from === 'local') {
    if (!args.path) fail('--path is required when --from local');
    return { protoRoot: args.path, cleanup: null };
  }
  if (args.from === 'github') {
    return { protoRoot: stageFromGithub(args.repo, args.ref), cleanup: null };
  }
  if (args.from === 'buf') {
    return {
      protoRoot: stageFromBuf(args.module, args.ref),
      cleanup: null,
    };
  }
  fail('--from must be "local", "github", or "buf"');
  return { protoRoot: '', cleanup: null };
}

function generate(args) {
  const { protoRoot } = resolveProtoRoot(args);
  const protoFiles = listProtoFiles(protoRoot);
  const methods = [];
  const messages = [];

  for (let i = 0; i < protoFiles.length; i += 1) {
    const file = protoFiles[i];
    const content = fs.readFileSync(file, 'utf8');
    methods.push(...parseProtoServices(content, file));
    messages.push(...parseProtoMessages(content));
  }

  if (methods.length === 0) {
    fail(
      'No service/rpc definitions found. Add `service` blocks to your .proto files.'
    );
  }

  writeGenerated(
    path.resolve(args.out),
    protoFiles,
    methods,
    messages,
    args.importFrom || ''
  );
}

function readLockFile() {
  const lockPath = path.resolve('protos.lock.json');
  if (!fs.existsSync(lockPath)) {
    fail('protos.lock.json not found in current directory');
  }
  const raw = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  // Keys starting with "_" are documentation-only (JSON has no // comments).
  const lock = {};
  const keys = Object.keys(raw);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (!key || key.startsWith('_')) {
      continue;
    }
    lock[key] = raw[key];
  }
  return lock;
}

function argsFromLock(lock) {
  const defaults = emptyArgs();
  defaults.command = 'generate';
  defaults.out = lock.out || './packages/react-native-proto/src/generated';
  defaults.importFrom = lock.importFrom || lock['import-from'] || '';

  if (lock.source === 'local') {
    if (!lock.path) {
      fail('protos.lock.json: "path" is required when source is "local"');
    }
    defaults.from = 'local';
    defaults.path = lock.path;
    return defaults;
  }

  if (lock.source === 'github') {
    if (!lock.repo || !lock.ref) {
      fail(
        'protos.lock.json: "repo" and "ref" are required when source is "github"'
      );
    }
    defaults.from = 'github';
    defaults.repo = lock.repo;
    defaults.ref = lock.ref;
    return defaults;
  }

  if (lock.source === 'buf') {
    if (!lock.module) {
      fail('protos.lock.json: "module" is required when source is "buf"');
    }
    defaults.from = 'buf';
    defaults.module = lock.module;
    defaults.ref = lock.ref || '';
    return defaults;
  }

  fail('protos.lock.json source must be "local", "github", or "buf"');
  return defaults;
}

function syncFromLock() {
  const lock = readLockFile();
  generate(argsFromLock(lock));
}

function resolveWatchArgs(args) {
  const hasGenerateFlags =
    Boolean(args.from) ||
    Boolean(args.path) ||
    Boolean(args.repo) ||
    Boolean(args.module);

  if (!hasGenerateFlags) {
    return argsFromLock(readLockFile());
  }

  if (!args.from) {
    fail('watch: --from is required when not using protos.lock.json');
  }
  return args;
}

function watchProtos(cliArgs) {
  const args = resolveWatchArgs(cliArgs);

  if (args.from !== 'local') {
    fail(
      'watch only supports --from local (or a protos.lock.json with source "local"). Use generate/sync for github/buf.'
    );
  }
  if (!args.path) {
    fail('watch: --path is required for local proto watching');
  }

  const watchDir = path.resolve(args.path);
  if (!fs.existsSync(watchDir)) {
    fail(`Proto path does not exist: ${watchDir}`);
  }

  console.log(`react-native-proto: watching ${watchDir}`);
  console.log(
    `react-native-proto: debounce ${WATCH_DEBOUNCE_MS}ms — press Ctrl+C to stop`
  );

  const runGenerate = (reason) => {
    console.log(`react-native-proto: ${reason}`);
    try {
      generate(args);
    } catch (err) {
      if (err instanceof CliError) {
        console.error(`react-native-proto: ${err.message}`);
      } else {
        console.error('react-native-proto: generate failed', err);
      }
    }
  };

  runGenerate('initial generate');

  let timer = null;
  const onChange = (eventType, filename) => {
    if (filename && !String(filename).endsWith('.proto')) {
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const label = filename
        ? `change detected (${filename}), regenerating…`
        : `change detected (${eventType || 'event'}), regenerating…`;
      runGenerate(label);
    }, WATCH_DEBOUNCE_MS);
  };

  let watcher;
  try {
    watcher = fs.watch(watchDir, { recursive: true }, onChange);
  } catch (_err) {
    console.warn(
      'react-native-proto: recursive fs.watch not supported; watching top-level directory only'
    );
    watcher = fs.watch(watchDir, onChange);
  }

  watcher.on('error', (err) => {
    console.error(`react-native-proto: watch error: ${err.message}`);
    if (timer) clearTimeout(timer);
    try {
      watcher.close();
    } catch (_closeErr) {
      // ignore
    }
    process.exit(1);
  });

  const shutdown = () => {
    console.log('\nreact-native-proto: stopped watching (SIGINT)');
    if (timer) clearTimeout(timer);
    try {
      watcher.close();
    } catch (_err) {
      // ignore
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.command === 'generate') {
      generate(args);
    } else if (args.command === 'sync') {
      syncFromLock();
    } else if (args.command === 'watch') {
      watchProtos(args);
    } else {
      fail(`Unknown command: ${args.command}`);
    }
  } catch (err) {
    if (err instanceof CliError) {
      console.error(`react-native-proto: ${err.message}`);
      process.exit(err.code);
    }
    throw err;
  }
}

main();

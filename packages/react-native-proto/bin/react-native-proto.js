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
    const body = stripNestedBlocks(messageMatch[2] || '');
    const fields = [];
    const seenNames = new Set();

    const mapRegex =
      /(?:repeated\s+|optional\s+|required\s+)?map\s*<\s*([\w.]+)\s*,\s*([\w.]+)\s*>\s+(\w+)\s*=\s*(\d+)\s*;/g;
    let mapMatch = mapRegex.exec(body);
    const mapFieldNames = new Set();
    while (mapMatch) {
      const keyTs = protoTypeToTs(mapMatch[1]);
      const valueTs = protoTypeToTs(mapMatch[2]);
      const fieldName = mapMatch[3];
      const fieldNumber = Number(mapMatch[4]) || 1;
      mapFieldNames.add(fieldName);
      const prop = safeTsPropName(fieldName);
      if (!seenNames.has(prop)) {
        seenNames.add(prop);
        fields.push({
          name: prop,
          protoName: fieldName,
          protoType: 'string',
          id: fieldNumber,
          repeated: false,
          tsType: `Record<${keyTs}, ${valueTs}>`,
        });
      }
      mapMatch = mapRegex.exec(body);
    }

    const fieldRegex =
      /(repeated|optional|required)?\s*([\w.]+)\s+(\w+)\s*=\s*(\d+)\s*;/g;
    let fieldMatch = fieldRegex.exec(body);
    while (fieldMatch) {
      const label = fieldMatch[1] || '';
      const typeName = fieldMatch[2];
      const fieldName = fieldMatch[3];
      const fieldNumber = Number(fieldMatch[4]) || 1;
      if (mapFieldNames.has(fieldName)) {
        fieldMatch = fieldRegex.exec(body);
        continue;
      }
      // Skip nested message/enum declarations mistaken as fields
      if (typeName === 'message' || typeName === 'enum' || typeName === 'oneof') {
        fieldMatch = fieldRegex.exec(body);
        continue;
      }
      const prop = safeTsPropName(fieldName);
      if (seenNames.has(prop)) {
        fieldMatch = fieldRegex.exec(body);
        continue;
      }
      seenNames.add(prop);
      let tsType = protoTypeToTs(typeName);
      if (label === 'repeated') {
        tsType = `${tsType}[]`;
      }
      fields.push({
        name: prop,
        protoName: fieldName,
        protoType: typeName,
        id: fieldNumber,
        repeated: label === 'repeated',
        tsType,
      });
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
  const parts = String(name).split('_');
  const first = parts[0] || '';
  const firstCamel =
    first.length === 0
      ? first
      : first.charAt(0).toLowerCase() + first.slice(1);
  const rest = parts
    .slice(1)
    .map((part) => {
      if (!part) return '';
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
  return firstCamel + rest;
}

const TS_RESERVED = new Set([
  'default',
  'class',
  'function',
  'var',
  'let',
  'const',
  'enum',
  'export',
  'import',
  'return',
  'new',
  'delete',
  'typeof',
  'instanceof',
  'void',
  'yield',
  'await',
  'extends',
  'implements',
  'interface',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'super',
  'this',
  'true',
  'false',
  'null',
  'undefined',
]);

function safeTsPropName(name) {
  const camel = toCamelCase(name);
  if (TS_RESERVED.has(camel)) return `${camel}_`;
  return camel;
}

function stripNestedBlocks(body) {
  let out = body;
  const nested = /(message|enum|oneof)\s+\w*\s*\{[^{}]*\}/g;
  while (nested.test(out)) {
    out = out.replace(nested, '');
    nested.lastIndex = 0;
  }
  return out;
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

function parseProtoEnums(fileContent) {
  const enums = [];
  const cleaned = stripProtoComments(fileContent);
  let packageName = '';
  const packageMatch = cleaned.match(/package\s+([A-Za-z0-9_.]+)\s*;/);
  if (packageMatch) {
    packageName = packageMatch[1];
  }
  const enumRegex = /enum\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let match = enumRegex.exec(cleaned);
  while (match) {
    const name = match[1];
    const body = match[2] || '';
    const values = [];
    const valueRegex = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\d+/gm;
    let valueMatch = valueRegex.exec(body);
    while (valueMatch) {
      values.push(valueMatch[1]);
      valueMatch = valueRegex.exec(body);
    }
    enums.push({
      name,
      values,
      packageName,
      fullName: packageName ? `${packageName}.${name}` : name,
    });
    match = enumRegex.exec(cleaned);
  }
  return enums;
}

function pascalSegment(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** package.foo.v1 → PackageFooV1 */
function packagePrefix(packageName) {
  return String(packageName || '')
    .split('.')
    .filter(Boolean)
    .map(pascalSegment)
    .join('');
}

/**
 * Unique export names for messages/enums that share a simple name across packages.
 * Unambiguous names stay as the proto simple name (e.g. GetActiveProfileRequest).
 */
function buildUniqueNames(items) {
  const byFull = new Map();
  for (let i = 0; i < (items || []).length; i += 1) {
    const item = items[i];
    const key = item.fullName || item.name;
    byFull.set(key, item);
  }
  const unique = Array.from(byFull.values());
  const counts = new Map();
  for (let i = 0; i < unique.length; i += 1) {
    const n = unique[i].name;
    counts.set(n, (counts.get(n) || 0) + 1);
  }
  /** fullName → exportName */
  const names = new Map();
  for (let i = 0; i < unique.length; i += 1) {
    const item = unique[i];
    const key = item.fullName || item.name;
    if ((counts.get(item.name) || 0) > 1) {
      names.set(key, `${packagePrefix(item.packageName)}${item.name}`);
    } else {
      names.set(key, item.name);
    }
  }
  return { names, unique };
}

function lookupUniqueName(names, packageName, typeName) {
  const simple = simpleTypeName(typeName);
  if (!typeName) return simple;
  if (String(typeName).includes('.')) {
    const hit = names.get(typeName);
    if (hit) return hit;
  }
  const samePkg = packageName ? `${packageName}.${simple}` : simple;
  if (names.has(samePkg)) return names.get(samePkg);

  const matches = [];
  for (const [full, exportName] of names.entries()) {
    if (full === simple || full.endsWith(`.${simple}`)) {
      matches.push(exportName);
    }
  }
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    // Ambiguous short name (multiple packages). Prefer a stable first match
    // so generated field types always resolve to an exported name.
    return matches.slice().sort()[0];
  }
  return simple;
}

function remapFieldTsType(tsType, message, messageNames, enumNames, stubs) {
  const raw = String(tsType || '');
  if (raw.startsWith('Record<')) return raw;
  const isArray = raw.endsWith('[]');
  const base = isArray ? raw.slice(0, -2) : raw;
  if (!base || stubs.has(base) || !/^[A-Z]/.test(base)) return raw;

  const samePkg = message.packageName ? `${message.packageName}.${base}` : base;
  if (messageNames.has(samePkg)) {
    const name = messageNames.get(samePkg);
    return isArray ? `${name}[]` : name;
  }
  if (enumNames.has(samePkg)) {
    const name = enumNames.get(samePkg);
    return isArray ? `${name}[]` : name;
  }
  const combined = new Map([...messageNames, ...enumNames]);
  const name = lookupUniqueName(combined, message.packageName, base);
  return isArray ? `${name}[]` : name;
}

function emitMessageConstructor(lines, exportName) {
  lines.push(
    `/** Construct a ${exportName} (same pattern as dart_proto named constructors). */`
  );
  lines.push(
    `export function ${exportName}(init: ${exportName} = {}): ${exportName} {`
  );
  lines.push('  return { ...init };');
  lines.push('}');
  lines.push('');
}

function writeMessageTypes(outDir, messages, enums = []) {
  const stubs = new Set([
    'LatLng',
    'Timestamp',
    'Duration',
    'Empty',
    'FieldMask',
    'Money',
  ]);
  const { names: messageNames, unique: uniqueMessages } =
    buildUniqueNames(messages);
  const { names: enumNames, unique: uniqueEnums } = buildUniqueNames(enums);

  const lines = [
    '/**',
    ' * Auto-generated TypeScript message types. Do not edit by hand.',
    ' * Field names are camelCase (proto snake_case mapped). Prefer these',
    ' * Request / Response types with createApi().',
    ' * Also exports constructor helpers so editors suggest fields, matching dart_proto:',
    ' *   getActiveProfile(GetActiveProfileRequest({ latLng: LatLng({ ... }) }))',
    ' * Colliding simple names across packages are prefixed (e.g. DriverAdminV1…).',
    ' */',
    '',
    '// Well-known / external stubs referenced by vendored protos',
    'export type LatLng = { latitude?: number; longitude?: number };',
    'export type Timestamp = { seconds?: number; nanos?: number };',
    'export type Duration = { seconds?: number; nanos?: number };',
    'export type Empty = Record<string, never>;',
    'export type FieldMask = { paths?: string[] };',
    'export type Money = { currencyCode?: string; units?: number; nanos?: number };',
    '',
  ];
  emitMessageConstructor(lines, 'LatLng');
  emitMessageConstructor(lines, 'Timestamp');
  emitMessageConstructor(lines, 'Duration');
  emitMessageConstructor(lines, 'Empty');
  emitMessageConstructor(lines, 'FieldMask');
  emitMessageConstructor(lines, 'Money');

  const sortedEnums = uniqueEnums
    .slice()
    .sort((a, b) => {
      const an = enumNames.get(a.fullName || a.name);
      const bn = enumNames.get(b.fullName || b.name);
      return String(an).localeCompare(String(bn));
    });
  const seenEnumExports = new Set(stubs);
  for (let i = 0; i < sortedEnums.length; i += 1) {
    const en = sortedEnums[i];
    const exportName = enumNames.get(en.fullName || en.name);
    if (!exportName || seenEnumExports.has(exportName)) continue;
    seenEnumExports.add(exportName);
    if (en.values.length > 0) {
      lines.push(
        `export type ${exportName} = ${en.values.map((v) => `'${v}'`).join(' | ')};`
      );
    } else {
      lines.push(`export type ${exportName} = string;`);
    }
    lines.push('');
  }

  const sorted = uniqueMessages
    .slice()
    .sort((a, b) => {
      const an = messageNames.get(a.fullName || a.name);
      const bn = messageNames.get(b.fullName || b.name);
      return String(an).localeCompare(String(bn));
    });

  const seenMsgExports = new Set(seenEnumExports);
  for (let i = 0; i < sorted.length; i += 1) {
    const msg = sorted[i];
    const exportName = messageNames.get(msg.fullName || msg.name);
    if (!exportName || stubs.has(msg.name) || seenMsgExports.has(exportName)) {
      continue;
    }
    seenMsgExports.add(exportName);
    lines.push(`export type ${exportName} = {`);
    for (let j = 0; j < msg.fields.length; j += 1) {
      const field = msg.fields[j];
      const tsType = remapFieldTsType(
        field.tsType,
        msg,
        messageNames,
        enumNames,
        stubs
      );
      lines.push(`  ${field.name}?: ${tsType};`);
    }
    lines.push('};');
    lines.push('');
    emitMessageConstructor(lines, exportName);
  }

  fs.writeFileSync(path.join(outDir, 'message-types.ts'), lines.join('\n'), 'utf8');
  return { messageNames, enumNames };
}

function writeCreateApi(
  outDir,
  methods,
  messages,
  enums,
  importFrom,
  nameMaps
) {
  const imports = resolveImportPaths(importFrom);
  const messageNames =
    (nameMaps && nameMaps.messageNames) || buildUniqueNames(messages).names;
  const enumNames =
    (nameMaps && nameMaps.enumNames) || buildUniqueNames(enums || []).names;

  const stubList = [
    'LatLng',
    'Timestamp',
    'Duration',
    'Empty',
    'FieldMask',
    'Money',
  ];
  const knownExports = new Set([
    ...messageNames.values(),
    ...enumNames.values(),
    ...stubList,
  ]);

  const referenced = new Set();
  for (let i = 0; i < methods.length; i += 1) {
    const m = methods[i];
    referenced.add(
      lookupUniqueName(messageNames, m.packageName, m.requestType)
    );
    referenced.add(
      lookupUniqueName(messageNames, m.packageName, m.responseType)
    );
  }
  // Nested field types from referenced messages
  for (let i = 0; i < (messages || []).length; i += 1) {
    const msg = messages[i];
    const exportName = messageNames.get(msg.fullName || msg.name);
    if (!exportName || !referenced.has(exportName)) continue;
    for (let j = 0; j < msg.fields.length; j += 1) {
      const remapped = remapFieldTsType(
        msg.fields[j].tsType,
        msg,
        messageNames,
        enumNames,
        new Set(stubList)
      );
      const t = String(remapped)
        .replace(/\[\]$/, '')
        .replace(/^Record<[^>]+>$/, '');
      if (/^[A-Z]/.test(t)) referenced.add(t);
    }
  }

  const typeImportNames = Array.from(referenced)
    .filter((n) => knownExports.has(n))
    .sort();

  // Group methods by service (same as Dart: merge same service name)
  const byService = new Map();
  for (let i = 0; i < methods.length; i += 1) {
    const m = methods[i];
    const list = byService.get(m.serviceName) || [];
    list.push(m);
    byService.set(m.serviceName, list);
  }

  const typeImport =
    typeImportNames.length > 0
      ? `import type {\n  ${typeImportNames.join(',\n  ')},\n} from './message-types';\n`
      : '';

  const lines = [
    '/**',
    ' * Auto-generated typed API factory. Do not edit by hand.',
    ' * Method params use generated Request types (not Record / object).',
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

    // Deduplicate methods by camel name (first wins) — mirrors Dart merge
    const seenMethods = new Set();
    lines.push(`export type ${iface} = {`);
    for (let j = 0; j < serviceMethods.length; j += 1) {
      const m = serviceMethods[j];
      const methodKey = toCamelCase(m.methodName);
      if (seenMethods.has(methodKey)) continue;
      seenMethods.add(methodKey);
      const req = lookupUniqueName(messageNames, m.packageName, m.requestType);
      const res = lookupUniqueName(messageNames, m.packageName, m.responseType);
      const reqType = knownExports.has(req) ? req : 'Record<string, unknown>';
      const resType = knownExports.has(res) ? res : 'Record<string, unknown>';
      if (m.kind === 'unary') {
        lines.push(
          `  ${methodKey}: (request?: ${reqType}, options?: { signal?: AbortSignal }) => Promise<${resType}>;`
        );
      } else {
        lines.push(
          `  ${methodKey}: (request?: ${reqType}, options?: { signal?: AbortSignal }) => AsyncIterable<${resType}>;`
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

function writeGenerated(
  outDir,
  protoRoot,
  protoFiles,
  methods,
  messages,
  enums,
  importFrom
) {
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

  const nameMaps = writeMessageTypes(outDir, messages, enums);
  writeCreateApi(outDir, methods, messages, enums, importFrom, nameMaps);

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

  if (pbjsBin) {
    // -p so imports like "service/types/v1/geometry.proto" resolve from vendor root
    // Also include protobufjs well-known google/protobuf/*.proto
    let pbjsGoogleRoot = '';
    try {
      pbjsGoogleRoot = path.dirname(require.resolve('protobufjs/package.json'));
    } catch (_err) {
      pbjsGoogleRoot = '';
    }
    const pbjsArgs = [
      '-t',
      'static-module',
      '-w',
      'commonjs',
      '-p',
      protoRoot,
    ];
    if (pbjsGoogleRoot) {
      pbjsArgs.push('-p', pbjsGoogleRoot);
    }
    pbjsArgs.push('-o', messagesJs, ...protoFiles);
    const useNpx = pbjsBin === 'pbjs';
    const result = spawnSync(
      useNpx ? 'npx' : process.execPath,
      useNpx ? ['--no-install', 'pbjs', ...pbjsArgs] : [pbjsBin, ...pbjsArgs],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    );
    if (result.status !== 0) {
      console.warn(
        'react-native-proto: pbjs failed; writing descriptor stub. Details:',
        result.stderr || result.stdout
      );
      writeMessagesStub(outDir, methods, messages, importFrom);
    } else {
      writeMessagesWrapper(outDir, messages, importFrom);
    }
  } else {
    writeMessagesStub(outDir, methods, messages, importFrom);
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
  const { names: messageNames, unique } = buildUniqueNames(messages);
  const sorted = unique.slice().sort((a, b) => {
    const an = messageNames.get(a.fullName || a.name);
    const bn = messageNames.get(b.fullName || b.name);
    return String(an).localeCompare(String(bn));
  });

  // Message TypeScript shapes live in message-types.ts only.
  // This file exports protobufjs Type codecs (values) with unique names.

  const namedExports = sorted
    .map((m) => {
      const exportName = messageNames.get(m.fullName || m.name);
      const access = pbAccessPath(m.fullName);
      return `export const ${exportName} = ${access} as Type;`;
    })
    .join('\n');

  // Also export top-level package namespaces when present (once per root)
  const packageRoots = Array.from(
    new Set(
      sorted
        .map((m) => m.packageName)
        .filter(Boolean)
        .map((pkg) => String(pkg).split('.')[0])
        .filter(Boolean)
    )
  );
  const packageExports = packageRoots
    .map((root) => `export const ${root} = pb.${root};`)
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

function writeMessagesStub(outDir, methods, messages, importFrom) {
  const paths = resolveImportPaths(importFrom);
  const typeNames = Array.from(
    new Set(methods.flatMap((m) => [m.requestType, m.responseType]))
  );

  const { names: messageNames, unique } = buildUniqueNames(messages);
  const sorted = unique.slice().sort((a, b) => {
    const an = messageNames.get(a.fullName || a.name);
    const bn = messageNames.get(b.fullName || b.name);
    return String(an).localeCompare(String(bn));
  });

  const fieldDefs = sorted
    .map((m) => {
      const fields = (m.fields || [])
        .map((f) => {
          const wireType = SCALAR_TO_TS[f.protoType]
            ? f.protoType
            : 'string';
          const rule = f.repeated ? ', rule: "repeated"' : '';
          return `    ${JSON.stringify(f.protoName || f.name)}: { type: ${JSON.stringify(wireType)}, id: ${Number(f.id) || 1}${rule} }`;
        })
        .join(',\n');
      return `  ${JSON.stringify(m.fullName)}: {\n${fields}\n  }`;
    })
    .join(',\n');

  const namedExports = sorted
    .map((m) => {
      const exportName = messageNames.get(m.fullName || m.name);
      return `export const ${exportName} = messageTypes[${JSON.stringify(m.fullName)}]!;`;
    })
    .join('\n');

  const stub = `import protobuf from 'protobufjs';
${paths.codecsImport}

/**
 * Fallback registry when pbjs is unavailable. Prefer regenerating with pbjs.
 * Types referenced: ${typeNames.join(', ')}
 */
const root = new protobuf.Root();
const fieldTable: Record<
  string,
  Record<string, { type: string; id: number; rule?: string }>
> = {
${fieldDefs}
};

export const messageTypes: Record<string, protobuf.Type> = {};
for (const [fullName, fields] of Object.entries(fieldTable)) {
  const type = new protobuf.Type(fullName.split('.').pop()!);
  for (const [fname, meta] of Object.entries(fields)) {
    type.add(
      new protobuf.Field(
        fname,
        meta.id,
        meta.type,
        meta.rule as 'repeated' | undefined
      )
    );
  }
  root.add(type);
  messageTypes[fullName] = type;
}

export const defaultCodecs = createCodecRegistry(messageTypes);
${namedExports}
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
  const enums = [];

  for (let i = 0; i < protoFiles.length; i += 1) {
    const file = protoFiles[i];
    const content = fs.readFileSync(file, 'utf8');
    methods.push(...parseProtoServices(content, file));
    messages.push(...parseProtoMessages(content));
    enums.push(...parseProtoEnums(content));
  }

  if (methods.length === 0) {
    fail(
      'No service/rpc definitions found. Add `service` blocks to your .proto files.'
    );
  }

  writeGenerated(
    path.resolve(args.out),
    path.resolve(protoRoot),
    protoFiles,
    methods,
    messages,
    enums,
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

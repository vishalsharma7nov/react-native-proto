import fs from 'fs';
import os from 'os';
import path from 'path';
import { ProtoSource } from '../src/proto-source';
import type { ProtoClientConfig } from '../src/types';

const {
  discoverLocalProtoDir,
  protoFilesIn,
} = require('../bin/proto-source.js') as {
  discoverLocalProtoDir: (cwd: string, explicitPath?: string | null) => string;
  protoFilesIn: (dir: string) => string[];
};

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rn-proto-source-'));
}

describe('ProtoSource', () => {
  it('local with no path discovers in the project', () => {
    const source = ProtoSource.local();
    expect(source.kind).toBe('local');
    expect(source.path).toBeUndefined();
  });

  it('local with a path', () => {
    const source = ProtoSource.local('vendor/protos');
    expect(source).toEqual({ kind: 'local', path: 'vendor/protos' });
  });

  it('github with optional subdirectory', () => {
    const source = ProtoSource.github({
      repo: 'https://github.com/you/protos.git',
      ref: 'v1.2.3',
      path: 'protos',
    });
    expect(source.kind).toBe('github');
    expect(source.repo).toBe('https://github.com/you/protos.git');
    expect(source.ref).toBe('v1.2.3');
    expect(source.path).toBe('protos');
  });

  it('buf module', () => {
    const source = ProtoSource.buf({
      module: 'buf.build/acme/petapis',
      ref: '1.0.0',
    });
    expect(source).toEqual({
      kind: 'buf',
      module: 'buf.build/acme/petapis',
      ref: '1.0.0',
    });
  });
});

describe('ProtoClientConfig.protoSource', () => {
  it('is omitted by default', () => {
    const config: ProtoClientConfig = { baseUrl: 'https://api.example.com' };
    expect(config.protoSource).toBeUndefined();
  });

  it('accepts local, github, and buf sources', () => {
    const config: ProtoClientConfig = {
      baseUrl: 'https://api.example.com',
      protoSource: ProtoSource.local('protos'),
    };
    expect(config.protoSource).toEqual({ kind: 'local', path: 'protos' });
  });
});

describe('discoverLocalProtoDir', () => {
  it('uses an explicit path when provided', () => {
    const cwd = makeTempDir();
    const protos = path.join(cwd, 'custom');
    fs.mkdirSync(protos);
    fs.writeFileSync(path.join(protos, 'user.proto'), 'syntax = "proto3";');
    expect(discoverLocalProtoDir(cwd, 'custom')).toBe(protos);
  });

  it('finds protos/ in the project directory', () => {
    const cwd = makeTempDir();
    const protos = path.join(cwd, 'protos');
    fs.mkdirSync(protos);
    fs.writeFileSync(path.join(protos, 'user.proto'), 'syntax = "proto3";');
    expect(discoverLocalProtoDir(cwd, null)).toBe(protos);
  });

  it('finds vendor/protos when protos/ is empty', () => {
    const cwd = makeTempDir();
    const vendor = path.join(cwd, 'vendor', 'protos');
    fs.mkdirSync(vendor, { recursive: true });
    fs.writeFileSync(path.join(vendor, 'user.proto'), 'syntax = "proto3";');
    expect(discoverLocalProtoDir(cwd, null)).toBe(vendor);
  });

  it('skips node_modules when scanning the project directory', () => {
    const cwd = makeTempDir();
    const nested = path.join(cwd, 'node_modules', 'other');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, 'skip.proto'), 'syntax = "proto3";');
    fs.writeFileSync(path.join(cwd, 'app.proto'), 'syntax = "proto3";');
    expect(discoverLocalProtoDir(cwd, null)).toBe(cwd);
    expect(protoFilesIn(cwd).some((f) => f.endsWith('skip.proto'))).toBe(false);
  });

  it('throws when nothing is found', () => {
    const cwd = makeTempDir();
    expect(() => discoverLocalProtoDir(cwd, null)).toThrow(/No \.proto files found/);
  });
});

'use strict';

const fs = require('fs');
const path = require('path');

const CANDIDATE_DIRS = ['protos', 'proto', 'vendor/protos'];
const SKIP_DIR_NAMES = new Set([
  'build',
  'node_modules',
  'ios',
  'android',
  '.dart_tool',
]);

function protoFilesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (_err) {
      return;
    }
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (!entry) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || SKIP_DIR_NAMES.has(entry.name)) {
          continue;
        }
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.proto')) {
        files.push(full);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Local folder, or `protos/`, `vendor/protos/`, then the project directory.
 * @param {string} cwd
 * @param {string | null | undefined} explicitPath
 * @returns {string}
 */
function discoverLocalProtoDir(cwd, explicitPath) {
  if (explicitPath) {
    const dir = path.isAbsolute(explicitPath)
      ? explicitPath
      : path.join(cwd, explicitPath);
    if (!fs.existsSync(dir)) {
      throw new Error(`Proto path does not exist: ${dir}`);
    }
    return dir;
  }

  for (let i = 0; i < CANDIDATE_DIRS.length; i += 1) {
    const dir = path.join(cwd, CANDIDATE_DIRS[i]);
    if (protoFilesIn(dir).length > 0) return dir;
  }

  if (protoFilesIn(cwd).length > 0) return cwd;

  throw new Error(
    'No .proto files found in the project directory. ' +
      "Set ProtoClientConfig.protoSource (e.g. ProtoSource.local('protos')) " +
      'or pass --path.'
  );
}

module.exports = {
  CANDIDATE_DIRS,
  SKIP_DIR_NAMES,
  protoFilesIn,
  discoverLocalProtoDir,
};

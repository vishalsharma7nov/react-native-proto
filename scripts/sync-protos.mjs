#!/usr/bin/env node
'use strict';

/**
 * Maintainer sync: read protos.lock.json and regenerate package sources.
 */
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'packages/react-native-proto/bin/react-native-proto.js');

const result = spawnSync(process.execPath, [cli, 'sync'], {
  cwd: root,
  stdio: 'inherit',
});

process.exit(result.status == null ? 1 : result.status);

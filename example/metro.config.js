const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro config for the Expo example inside an npm workspace.
 *
 * - watchFolders: so Metro can see packages/react-native-proto source
 * - nodeModulesPaths: resolve deps from example and repo root
 * - extraNodeModules: always resolve the local library package
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@vishalsharma7nov/react-native-proto': path.resolve(
    workspaceRoot,
    'packages/react-native-proto'
  ),
};

module.exports = config;

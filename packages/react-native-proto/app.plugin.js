/**
 * Expo config plugin for @vishalsharma7nov/react-native-proto.
 *
 * Native iOS (react-native-proto.podspec) and Android
 * (com.vishalsharma7nov.reactnativeproto) ship with the package and are
 * normally picked up by React Native / Expo autolinking. This plugin is a
 * lightweight hook for apps that list it under `plugins` in app.json / app.config.
 *
 * Usage in app.json:
 *   "plugins": ["@vishalsharma7nov/react-native-proto"]
 */

'use strict';

function withReactNativeProto(config) {
  let configPlugins;
  try {
    // Optional peer — Expo apps have this; plain RN apps may not.
    configPlugins = require('@expo/config-plugins');
  } catch (_err) {
    console.warn(
      '[react-native-proto] @expo/config-plugins not found; Expo plugin is a no-op. ' +
        'Native modules rely on autolinking (podspec + android package).'
    );
    return config;
  }

  const { createRunOncePlugin, withDangerousMod } = configPlugins;

  const withNativeMods = (cfg) => {
    cfg = withDangerousMod(cfg, [
      'ios',
      async (config) => {
        // Podspec at package root is autolinked; no Podfile edits required.
        return config;
      },
    ]);

    cfg = withDangerousMod(cfg, [
      'android',
      async (config) => {
        // Android package
        // com.vishalsharma7nov.reactnativeproto.ReactNativeProtoNativeGrpcModule
        // is autolinked when the library is installed.
        return config;
      },
    ]);

    return cfg;
  };

  if (typeof createRunOncePlugin === 'function') {
    return createRunOncePlugin(
      withNativeMods,
      'react-native-proto',
      '0.1.0'
    )(config);
  }

  return withNativeMods(config);
}

module.exports = withReactNativeProto;

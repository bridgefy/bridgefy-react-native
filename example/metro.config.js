const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const pak = require('../package.json');
const root = path.resolve(__dirname, '../');

const modules = Object.keys({
  ...pak.peerDependencies,
});

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    blacklistRE: exclusionList(
      modules.map(
        m => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`),
      ),
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },
  projectRoot: __dirname,
  watchFolders: [root],
};

module.exports = mergeConfig(defaultConfig, config);

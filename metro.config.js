/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
//
// module.exports = {
//   transformer: {
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: false,
//       },
//     }),
//   },
// };

const blacklist = require("metro-config/src/defaults/blacklist");
const path = require("path");
const globToRegex = require("glob-to-regexp");

function createBlockedListRegexs() {
  const nodeModuleDirs = [
    globToRegex(`${__dirname}/node_modules/react-native-gesture-handler/Example/*`)
  ];
  console.debug("Blocked modules ", nodeModuleDirs);

  return blacklist(nodeModuleDirs);
}

const pkg = require("./package.json");

module.exports = {
  projectRoot: __dirname,
  resolver: {
    blacklistRE: createBlockedListRegexs(),
    providesModuleNodeModules: Object.keys(pkg.dependencies)
  }
};

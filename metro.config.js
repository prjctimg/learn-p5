const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes("json")) {
  config.resolver.assetExts.push("json");
}

module.exports = config;

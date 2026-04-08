const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Ignore bundling web and node specific ONNX runtimes
  // React Native will use onnxruntime-react-native under the hood
  if (moduleName.startsWith("onnxruntime-node") || moduleName.startsWith("onnxruntime-web")) {
    return {
      type: "empty",
    };
  }

  // Chain to the standard Metro resolver
  return context.resolveRequest(context, moduleName, platform);
};

// If using local models as assets, you need to add the `bin` extension
config.resolver.assetExts.push("bin");

module.exports = config;

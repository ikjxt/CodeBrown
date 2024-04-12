module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // [4/10] To fix: "Failed to create a worklet. Did you forget to add Reanimated Babel plugin in babel.config.js? See installation docs at https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation#babel-plugin., js engine: hermes"
  };
};



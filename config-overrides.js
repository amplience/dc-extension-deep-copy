module.exports = function override(config, env) {

  config.resolve.fallback = {
    crypto: false,
  };

  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  })

  return config;
}
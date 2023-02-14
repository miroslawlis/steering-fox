const rules = require("./webpack.rules");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  experiments: {
    topLevelAwait: true,
  },
  // externals: {
  //   serialport: "serialport", // Ref: https://copyprogramming.com/howto/electron-and-serial-ports
  // },
};

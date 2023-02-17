module.exports = {
  plugins: [
    [
      "postcss-preset-env",
      {
        stage: 2,
        features: {
          "nesting-rules": true,
          "custom-media-queries": true,
          "custom-properties": true,
          "custom-selectors": true,
          clamp: true,
          "cascade-layers": true,
          "nested-calc": true,
          "not-pseudo-class": true,
          "is-pseudo-class": true
        },
      },
    ],
  ],
};

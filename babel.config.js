module.exports = {
  presets: ['module:metro-react-native-babel-preset',
            //added for build
            '@babel/preset-env',
            '@babel/preset-react',
            // '@babel/preset-typescript'
  ],
  // SQLite 사용위해 추가
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-transform-modules-commonjs', { loose: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }]
      ['react-native-reanimated/plugin'],
      ['@babel/plugin-transform-named-capturing-groups-regex'],
  ],
};

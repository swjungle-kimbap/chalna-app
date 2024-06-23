module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  // SQLite 사용위해 추가
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};

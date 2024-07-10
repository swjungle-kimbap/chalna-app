const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

const defaultConfig = getDefaultConfig(__dirname);
const { resolver: { assetExts } } = defaultConfig;

const config = {
    resolver: {
        // 애플리케이션에서 사용되는 정적 파일의 확장자를 정의합니다.
        assetExts: [...assetExts, 'gif'],
    },
};

module.exports = mergeConfig(defaultConfig, config);

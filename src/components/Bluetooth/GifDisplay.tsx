import React from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

const GifDisplay = ({ source, style }) => {
    return (
        <View style={styles.container}>
            <FastImage
                source={source}
                style={[styles.gif, style]}
                resizeMode={FastImage.resizeMode.contain}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    gif: {
        width: 200,
        height: 200,
    },
});

export default GifDisplay;

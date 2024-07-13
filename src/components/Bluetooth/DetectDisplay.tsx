import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';

interface DetectDisplayProps {
  uuids: Set<string>;
}

const DetectDisplay: React.FC<DetectDisplayProps> = ({ uuids }) => {
  const fadeAnimMap = useRef(new Map<string, Animated.Value>()).current;

  useEffect(() => {
    uuids.forEach((uuid) => {
      if (!fadeAnimMap.has(uuid)) {
        fadeAnimMap.set(uuid, new Animated.Value(0));
      }
      Animated.timing(fadeAnimMap.get(uuid), {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });

    fadeAnimMap.forEach((anim, uuid) => {
      if (!uuids.has(uuid)) {
        Animated.timing(anim, {
          toValue: 0,
          duration: 500, // fade out 지속 시간을 1500ms로 늘립니다.
          useNativeDriver: true,
        }).start(() => fadeAnimMap.delete(uuid));
      }
    });
  }, [uuids, fadeAnimMap]);

  return (
    <View style={styles.container}>
      {Array.from(uuids).map((uuid) => (
        <Animated.View key={uuid} style={{ ...styles.imageContainer, opacity: fadeAnimMap.get(uuid) }}>
          <FastImage
            style={styles.image}
            source={require('../../assets/images/cute.png')}
            resizeMode={FastImage.resizeMode.contain}
          />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imageContainer: {
    margin: 5,
  },
  image: {
    width: 50,
    height: 50,
  },
});

export default DetectDisplay;

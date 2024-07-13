import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import styles from './BleComponent.style';

const MessageGif = ({ setShowMsgBox }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => isMounted && animate());
    };

    animate();

    return () => {
      isMounted = false;
    };
  }, [moveAnim]);

  return (
    <TouchableOpacity onPress={() => setShowMsgBox(true)}>
      <Animated.View style={[styles.messageButtonContainer, { transform: [{ translateY: moveAnim }] }]}>
        <FastImage
          source={require('../../assets/animations/message.gif')}
          style={styles.messageGif}
          resizeMode={FastImage.resizeMode.contain}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default MessageGif;

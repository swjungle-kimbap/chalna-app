import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import FontTheme from '../../styles/FontTheme';
import FastImage from 'react-native-fast-image';

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
        <View style={styles.container}>
            <FastImage
                source={require('../../assets/animations/message.gif')}
                style={[styles.gif]}
                resizeMode={FastImage.resizeMode.contain}
            />
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginTop: 20,
    fontFamily: FontTheme.fonts.main,
    color: 'black'
  },
  gif: {
    width: 150,
    height: 150,
},
});

export default MessageGif;
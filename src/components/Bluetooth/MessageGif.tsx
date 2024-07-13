import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import FontTheme from '../../styles/FontTheme';
import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';

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
            <Animated.View style={{ transform: [{ translateY: moveAnim }] }}>
                <LottieView
                    source={require('../../assets/animations/paperplane.json')}
    

                    autoPlay
                    loop
                    style={styles.lottie}
                />
            </Animated.View>
            {/* <FastImage
                // source={require('../../assets/animations/message.gif')}
                source={require('../../assets/animations/paperplane2.gif')}
                style={[styles.gif]}
                resizeMode={FastImage.resizeMode.contain}
            /> */}
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
  lottie: {
    width: 250,
    height: 250,
  },
});

// // const styles = StyleSheet.create({
// //   container: {
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   text: {
// //     fontSize: 20,
// //     marginTop: 20,
// //     fontFamily: FontTheme.fonts.main,
// //     color: 'black'
// //   },
// //   gif: {
// //     width: 300,
// //     height: 300,
// // },
// });

export default MessageGif;
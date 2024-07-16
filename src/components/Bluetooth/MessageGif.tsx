import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, TouchableOpacity } from 'react-native';
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
    <Animated.View style={{ transform: [{ translateY: moveAnim }] }}>
      <TouchableOpacity onPress={() => setShowMsgBox(true)} 
        hitSlop={{ top: 100, bottom: 100, left:100, right: 100 }} >
        <LottieView
            source={require('../../assets/animations/paperplane.json')}
            autoPlay
            loop
            style={styles.lottie}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  lottie: {
    width: 250,
    height: 250,
  },
});


export default MessageGif;
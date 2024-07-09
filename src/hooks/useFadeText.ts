import { useRef } from "react";
import { Animated } from "react-native";

const useFadeText = (): [() => void, Animated.Value, Animated.Value] => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  const fadeInAndMoveUp = () => {
    fadeAnim.setValue(0);
    translateY.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      fadeOutAndMoveUp();
    });
  };

  const fadeOutAndMoveUp = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 3000,
        useNativeDriver: true,
      })
    ]).start();
  };

  return [fadeInAndMoveUp, fadeAnim, translateY];
}

export default useFadeText;
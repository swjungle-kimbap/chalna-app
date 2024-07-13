import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView, Animated, Keyboard, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import DetectDisplay from "../../components/Bluetooth/DetectDisplay";
import styles from './BleComponent.style';


interface BleMainComponentProps {
  uuids: Set<string>;
  style?: ViewStyle;
}


const BleMainComponent: React.FC<BleMainComponentProps> = ({ uuids, style }) => {
  const animationRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // cleanup function
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (!isKeyboardVisible && animationRef.current) {
      animationRef.current.play();
    }
  }, [isKeyboardVisible]);

  useEffect(() => {
    if (uuids.size === 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 4000,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [uuids]);

  return (
    !isKeyboardVisible && (
    <SafeAreaView style={[styles.bleMainContainer, style]}>
      <Animated.View style={[styles.detectContainer, {opacity: fadeAnim }]}>
        <DetectDisplay uuids={uuids} />
      </Animated.View>
      <LottieView
        ref={animationRef}
        source={require('../../assets/animations/WaveAnimation.json')}
        style={styles.lottieImage}
        speed={1.5}
        loop
        onLayout={() => {
          if (!isKeyboardVisible && animationRef.current) {
            animationRef.current.play();
          }
        }}
      />
    </SafeAreaView>
    )
  );
};

export default BleMainComponent;

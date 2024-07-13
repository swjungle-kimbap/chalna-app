import React, { useRef, useEffect } from 'react';
import { SafeAreaView, Animated, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import DetectDisplay from "../../components/Bluetooth/DetectDisplay";
import styles from './BleComponent.style';

interface BleMainComponentProps {
  isKeyboardVisible: boolean;
  uuids: Set<string>;
  style?: ViewStyle;
}

const BleMainComponent: React.FC<BleMainComponentProps> = ({ isKeyboardVisible, uuids, style }) => {
  const animationRef = useRef<LottieView>(null);
  const fadeAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isKeyboardVisible && animationRef.current) {
      animationRef.current.play();
    }
  }, [isKeyboardVisible]);

  useEffect(() => {
    if (uuids.size === 0) {
      Animated.timing(fadeAnim2, {
        toValue: 0,
        duration: 4000,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [uuids]);

  return (
    <SafeAreaView style={[styles.bleMainContainer, style]}>
      <Animated.View style={[styles.detectContainer, {opacity: fadeAnim2 }]}>
        <DetectDisplay uuids={uuids} />
      </Animated.View>
      <LottieView
        ref={animationRef}
        source={require('../../assets/animations/WaveAnimation.json')}
        style={styles.lottieImage}
        speed={2.5}
        loop
        onLayout={() => {
          if (!isKeyboardVisible && animationRef.current) {
            animationRef.current.play();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default BleMainComponent;

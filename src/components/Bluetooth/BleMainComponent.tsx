import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView, Animated, Keyboard, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import DetectDisplay from "../../components/Bluetooth/DetectDisplay";
import styles from './BleComponent.style';


interface BleMainComponentProps {
  uuids: Set<string>;
  style?: ViewStyle;
  setShowMsgBox: (show: boolean) => void;
}


const BleMainComponent: React.FC<BleMainComponentProps> = ({ uuids, style, setShowMsgBox }) => {
  const animationRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

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
    <SafeAreaView style={[styles.bleMainContainer, style]}>
      <Animated.View style={[styles.detectContainer, {opacity: fadeAnim }]}>
        <DetectDisplay uuids={uuids} setShowMsgBox={setShowMsgBox}/>
      </Animated.View>
      <LottieView
        ref={animationRef}
        source={require('../../assets/animations/WaveAnimation.json')}
        style={styles.lottieImage}
        speed={1.5}
        loop
        onLayout={() => {
          if (animationRef.current) {
            animationRef.current.play();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default BleMainComponent;

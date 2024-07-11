import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import FontTheme from '../../styles/FontTheme';

const DancingText = ({ handleBLEButton }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    
    const animate = () => {
      if (!isMounted) return;
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: -30,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 30,
          duration: 1000,
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
    <TouchableOpacity onPress={handleBLEButton}>
      <View style={styles.container}>
        <Animated.Text style={[styles.text, { transform: [{ translateY: moveAnim }] }]}>
          눌러서 시작하기!
        </Animated.Text>
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
    color: 'gray',
    fontFamily: FontTheme.fonts.main,
  },
});

export default DancingText;
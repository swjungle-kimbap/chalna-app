import React, { useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';

const Toggle = () => {
  const [isActive, setIsActive] = useState(false);
  const animation = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    setIsActive(prevState => !prevState); // 토글 상태 변경
  };

  const backgroundColorStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#E52222', '#2EAA3B'],
    }),
  };

  return (
    <TouchableOpacity onPress={toggle}>
      <Animated.View style={[styles.button, backgroundColorStyle]}>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});

export default Toggle;

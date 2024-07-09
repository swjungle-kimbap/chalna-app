import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import FontTheme from '../../styles/FontTheme';

const DancingText = ({setShowMsgBox}) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: -10, // 위로 이동할 거리
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 10, // 아래로 이동할 거리
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0, // 원래 위치로 이동
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => animate()); // 애니메이션이 끝나면 다시 시작
    };

    animate();
  }, [moveAnim]);

  return (
    <TouchableOpacity onPress={() => setShowMsgBox(true)}>
      <View style={styles.container}>
        <Animated.Text style={[styles.text, { transform: [{ translateY: moveAnim }] }]}>
          메세지 보내기
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
    marginTop: 20,
    fontFamily: FontTheme.fonts.main,
    color: 'black'
  },
});

export default DancingText;
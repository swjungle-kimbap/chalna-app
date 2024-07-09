import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import FontTheme from '../../styles/FontTheme';

const DancingWords = () => {
  const moveAnim1 = useRef(new Animated.Value(0)).current;
  const moveAnim2 = useRef(new Animated.Value(0)).current;
  const moveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animation, delay) => {
      return Animated.sequence([
        Animated.timing(animation, {
          toValue: -10,
          duration: 400,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 10,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    };

    const startAnimations = () => {
      Animated.sequence([
        Animated.delay(0), 
        createAnimation(moveAnim1, 1200),
        createAnimation(moveAnim2, 600),
        createAnimation(moveAnim3, 0),
        Animated.parallel([
          createAnimation(moveAnim1, 0),
          createAnimation(moveAnim2, 0),
          createAnimation(moveAnim3, 0),
        ]),
      ]).start(() => startAnimations()); // Loop the animation
    };

    startAnimations();
  }, [moveAnim1, moveAnim2, moveAnim3]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.text, { transform: [{ translateY: moveAnim1 }] }]}>
          탐
        </Animated.Text>
        <Animated.Text style={[styles.text, { transform: [{ translateY: moveAnim2 }] }]}>
          색
        </Animated.Text>
        <Animated.Text style={[styles.text, { transform: [{ translateY: moveAnim3 }] }]}>
          중
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 30,
    color: 'black',
    marginHorizontal: 10,
    fontFamily: FontTheme.fonts.main
  },
});

export default DancingWords;
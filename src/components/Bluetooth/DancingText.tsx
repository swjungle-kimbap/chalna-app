import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert, Button } from 'react-native';
import FontTheme from '../../styles/FontTheme';
import BackgroundNonDismissibleModal from '../common/AlertBackgroundNonDismissbleModal'
import { useModal } from '../../context/ModalContext';

const DancingText = ({ handleBLEButton }) => {

  const { showModal } = useModal();

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

  const handlePress = () => {
    showModal(
      '만남로그', 
      '로그는 친구끼리만 볼 수 있어요! 😮', 
      () => console.log('Confirmed'), 
      () => console.log('Cancelled')
    );
  };


  return (
    <TouchableOpacity onPress={handleBLEButton}>
      <View style={styles.container}>
        <Animated.Text style={[styles.text, { transform: [{ translateY: moveAnim }] }]}>
          눌러서 시작하기!
        </Animated.Text>

  
        <Button 
          title="Show Modal" 
          onPress={handlePress} 
        />

      </View>
    </TouchableOpacity>

  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 300,
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
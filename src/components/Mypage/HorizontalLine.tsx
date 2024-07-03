import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type HorizontalLineProps = {
  style?:ViewStyle
}

const HorizontalLine: React.FC<HorizontalLineProps> = ({style}) => {
  return (
    <View style={[styles.horizontalLine, style]} />
  );
};

const styles = StyleSheet.create({
  horizontalLine: {
    borderBottomColor: '#979797',
    borderBottomWidth: 0.3, 
    marginVertical: 10, 
    width: "100%",
  },
});

export default HorizontalLine;

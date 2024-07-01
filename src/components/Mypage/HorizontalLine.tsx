import React from 'react';
import { View, StyleSheet } from 'react-native';

const HorizontalLine = () => {
  return (
    <View style={styles.horizontalLine} />
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

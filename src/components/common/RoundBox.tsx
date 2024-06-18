import React from 'react';
import { View, StyleSheet } from 'react-native';

const RoundBox: React.FC<any> = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF', 
    padding: 10, 
    margin: 10, 
  },
});

export default RoundBox;

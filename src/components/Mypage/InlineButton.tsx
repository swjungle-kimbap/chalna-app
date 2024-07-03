import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet, TextStyle } from "react-native";
import HorizontalLine from "./HorizontalLine";
import FontTheme from '../../styles/FontTheme';

interface InlineButtonProps {
  children?: React.ReactNode;
  onPressfunc?: () => void;
  textstyle?: TextStyle;
  text:string;
  horizon?: 'top' | 'bottom' | 'none'
  isdisable?: boolean
}

const InlineButton: React.FC<InlineButtonProps> = ({children, text, onPressfunc, textstyle, horizon='top', isdisable}) => {
  return (
    <>
      {horizon === 'top' && <HorizontalLine />}
      {
        onPressfunc ? (
        <TouchableOpacity onPress={onPressfunc} disabled={isdisable}>
          <View style={styles.settingButtonWrapper}>
            <Text style={[styles.text, textstyle]}>{text}</Text>
            {children}
          </View>
        </TouchableOpacity>) :
        (
          <View style={styles.settingButtonWrapper}>
            <Text style={[styles.text, textstyle]}>{text}</Text>
            {children}
          </View>
        )
      }
      {horizon === 'bottom' && <HorizontalLine />}
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
    fontFamily: FontTheme.fonts.main, 
    paddingRight: 7,
  },
  settingButtonWrapper: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

export default InlineButton;

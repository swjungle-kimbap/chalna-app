import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet, ImageSourcePropType, TextStyle } from "react-native";
import HorizontalLine from "./HorizontalLine";
import FontTheme from '../../styles/FontTheme';

interface InlineButtonProps {
  children: React.ReactNode;
  onPressfunc: () => void;
  imgSource?: ImageSourcePropType;
  textstyle?: TextStyle
}

const InlineButton: React.FC<InlineButtonProps> = ({children, onPressfunc, imgSource, textstyle}) => {
  return (
    <>
      <HorizontalLine />
      <TouchableOpacity onPress={onPressfunc}>
        <View style={styles.settingButtonWrapper}>
          <Text style={[styles.text, textstyle]}>{children}</Text>
          {imgSource ? (<Image source={imgSource}/>) : <></>}
        </View>
      </TouchableOpacity>
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

import React from 'react';
import Text from './Text';
import { Image, TouchableOpacity, TouchableOpacityProps, 
  ImageSourcePropType, ImageStyle, TextStyle, ViewStyle } from 'react-native';

type ImageTextButtonProps = TouchableOpacityProps & {
  iconSource?: ImageSourcePropType;
  title?: string; 
  titleStyle?: TextStyle; 
  imageStyle?: ImageStyle; 
  containerStyle?: ViewStyle; 
}

const ImageTextButton: React.FC<ImageTextButtonProps> = ({
  onPress,
  iconSource,
  title,
  titleStyle,
  imageStyle,
  containerStyle,
  ...rest
}) => {
  const renderContent = () => {
    if (iconSource) {
      return (
        <Image source={iconSource} style={imageStyle} resizeMode="contain" />
      );
    } else if (title) {
      return (
        <Text style={titleStyle}>{title}</Text>
      );
    }
    return null; 
  };

  return (
    <TouchableOpacity onPress={onPress} style={containerStyle} {...rest}>
      {renderContent()}
    </TouchableOpacity>
  );
};

export default ImageTextButton;

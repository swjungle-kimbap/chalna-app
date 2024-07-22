import React, { useCallback } from 'react';
import Text from './Text';
import { Image, TouchableOpacity, TouchableOpacityProps,
  ImageSourcePropType, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import throttle from 'lodash/throttle';

type ImageTextButtonProps = TouchableOpacityProps & {
  iconSource?: ImageSourcePropType;
  title?: string;
  titleStyle?: TextStyle;
  imageStyle?: ImageStyle;
  variant?: "title" | "main" | "sub";
  containerStyle?: ViewStyle;
}

const ImageTextButton: React.FC<ImageTextButtonProps> = ({
  onPress,
  iconSource,
  title,
  titleStyle,
  imageStyle,
  containerStyle,
  variant,
  disabled,
  ...rest
}) => {
  const throttledOnPress = useCallback(
    throttle((event) => {
      if (onPress) onPress(event);
    }, 1000), // 1초 동안 한 번만 호출됨
    [onPress]
  );

  const renderContent = () => {
    if (iconSource) {
      return (
        <Image source={iconSource} style={imageStyle} resizeMode="contain" />
      );
    } else if (title) {
      return (
        <Text
            variant={variant}
            style={[
                titleStyle,
                disabled && {color: '#a9a9a9'}, // grey out text if disabled
            ]}>
            {title}
        </Text>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity onPress={throttledOnPress} style={containerStyle} disabled={disabled} {...rest}>
      {renderContent()}
    </TouchableOpacity>
  );
};


export default ImageTextButton;

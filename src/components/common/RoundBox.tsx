import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface RoundBoxProps {
  children: React.ReactNode;
  width?: string | number;          // 박스 크기 (width & height)
  height?: string | number;          // 박스 크기 (width & height)
  radius?: number;        // 둥근 정도 (borderRadius)
  shadow?: ViewStyle;     // 그림자 스타일 (선택 사항)
  style?: ViewStyle;      // 추가적인 스타일
  color?: string;        // 배경 색상
  padding?: number;      // 내부 여백
  margin?: number;        // 외부 여백
}

const RoundBox: React.FC<RoundBoxProps> = ({
  children,
  width,         // 박스 크기 (width & height)
  height, 
  radius = 5,
  shadow,
  style,
  color = '#FFFFFF',  // 기본 색상 흰색
  margin = 5,
  padding = 10,       // 기본 padding 10
}) => {
  const containerStyle = StyleSheet.flatten([
    styles.container,
    {
      width: width,
      height: height,
      borderRadius: radius,
      backgroundColor: color,
      padding: padding,
      margin: margin,
      ...shadow, // 그림자 스타일 적용
    },
    style, // 사용자가 전달한 스타일을 마지막에 적용하여 덮어쓰도록 합니다.
  ]);

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4, // Android 전용 (선택 사항)
  },
});

export default RoundBox;

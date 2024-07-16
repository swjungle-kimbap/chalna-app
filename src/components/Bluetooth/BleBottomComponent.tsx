import React, {useEffect, useRef} from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle, UIManager, Keyboard, LayoutAnimation } from 'react-native';
import styles from './BleComponent.style';
import { MsgSendCntState } from '../../recoil/atoms';
import { useRecoilValue } from 'recoil';

interface BleBottomComponentProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  remainingTime: number;
  showMsgBox: boolean;
  style?: ViewStyle;
}

const BleBottomComponent: React.FC<BleBottomComponentProps> = ({
  fadeAnim,
  translateY,
  remainingTime,
  style,
}) => {
  const msgSendCnt = useRecoilValue(MsgSendCntState);

  return (
    <View style={[styles.bleBottomContainer, style]}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateY }] }}>
        <Text style={styles.messageText}>
          {msgSendCnt ? `${msgSendCnt}명에게 인연 메세지를 보냈습니다.` : "메세지를 보낼 수 없는 대상입니다. 다시 보내 주세요!"}
        </Text>
      </Animated.View>
      <Text style={styles.blockText}>인연 메세지는</Text>
      <Text style={styles.blockText2}>{remainingTime}초 뒤에 다시 보낼 수 있습니다.</Text>
    </View>
  );
};

export default BleBottomComponent;

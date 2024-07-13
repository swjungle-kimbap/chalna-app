import React from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';
import MessageBox from "../../components/Bluetooth/MessageBox";
import MessageGif from "../../components/Bluetooth/MessageGif";
import styles from './BleComponent.style';

interface BleBottomComponentProps {
  isBlocked: boolean;
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  msgSendCnt: number;
  remainingTime: number;
  showMsgBox: boolean;
  uuidSet: Set<string>;
  setRemainingTime: (time: number) => void;
  setShowMsgBox: (show: boolean) => void;
  fadeInAndMoveUp: () => void;
  style?: ViewStyle;
}

const BleBottomComponent: React.FC<BleBottomComponentProps> = ({
  isBlocked,
  fadeAnim,
  translateY,
  msgSendCnt,
  remainingTime,
  showMsgBox,
  uuidSet,
  setRemainingTime,
  setShowMsgBox,
  fadeInAndMoveUp,
  style,
}) => {
  return (
    <View style={[styles.bleBottomContainer, style]}>
      {isBlocked ? (
        <>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateY }] }}>
            <Text style={styles.messageText}>
              {msgSendCnt ? `${msgSendCnt}명에게 인연 메세지를 보냈습니다.` : "메세지를 보낼 수 없는 대상입니다. 다시 보내 주세요!"}
            </Text>
          </Animated.View>
          <Text style={styles.blockText}>인연 메세지는</Text>
          <Text style={styles.blockText2}>{remainingTime}초 뒤에 다시 보낼 수 있습니다.</Text>
        </>
      ) : uuidSet.size > 0 ? (
        showMsgBox ? (
          <MessageBox
            uuids={uuidSet}
            setRemainingTime={setRemainingTime}
            setShowMsgBox={setShowMsgBox}
            fadeInAndMoveUp={fadeInAndMoveUp}
          />
        ) : (
          <>
            <View style={styles.bleBottomSubContainer}>
              <Text style={styles.findTextSmall}>주위 {uuidSet.size}명의 인연을 찾았습니다!</Text>
              <MessageGif setShowMsgBox={setShowMsgBox} />
            </View>
          </>
        )
      ) : (
        <View style={styles.bleBottomSubContainer}>
          <Text style={styles.findText}>주위의 인연을 찾고 있습니다.</Text>
        </View>
      )}
    </View>
  );
};

export default BleBottomComponent;

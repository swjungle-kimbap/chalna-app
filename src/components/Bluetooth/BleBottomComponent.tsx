import React, {useEffect, useRef} from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle, UIManager, Keyboard, LayoutAnimation } from 'react-native';
import MessageBox from "../../components/Bluetooth/MessageBox";
import MessageGif from "../../components/Bluetooth/MessageGif";
import styles from './BleComponent.style';

interface BleBottomComponentProps {
  isBlocked: boolean;
  // fadeAnim: Animated.Value;
  // translateY: Animated.Value;
  msgSendCnt: number;
  remainingTime: number;
  showMsgBox: boolean;
  uuidSet: Set<string>;
  setRemainingTime: (time: number) => void;
  setShowMsgBox: (show: boolean) => void;
  // fadeInAndMoveUp: () => void;
  style?: ViewStyle;
}

const BleBottomComponent: React.FC<BleBottomComponentProps> = ({
  isBlocked,
  // fadeAnim,
  // translateY,
  msgSendCnt,
  remainingTime,
  showMsgBox,
  uuidSet,
  setRemainingTime,
  setShowMsgBox,
  // fadeInAndMoveUp,
  style,
}) => {

  const bottomSubContainerRef = useRef<View>(null);

  // useEffect를 통해 Keyboard 이벤트 처리
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // 키보드가 올라오면 bottomSubContainer를 숨깁니다.
      if (bottomSubContainerRef.current) {
        bottomSubContainerRef.current.setNativeProps({ style: { opacity: 0, height: 0 } });
      }
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // 키보드가 숨겨지면 bottomSubContainer를 다시 보여줍니다.
      if (bottomSubContainerRef.current) {
        bottomSubContainerRef.current.setNativeProps({ style: { opacity: 1, height: 'auto' } });
      }
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View style={[styles.bleBottomContainer, style]}>
      {isBlocked ? (
        <>
          {/* <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateY }] }}> */}
          <Animated.View>
            <Text style={styles.messageText}>
              {msgSendCnt ? `${msgSendCnt}명에게 인연 메세지를 보냈습니다.` : "메세지를 보낼 수 없는 대상입니다. 다시 보내 주세요!"}
            </Text>
          </Animated.View>
          <Text style={styles.blockText}>인연 메세지는</Text>
          <Text style={styles.blockText2}>{remainingTime}초 뒤에 다시 보낼 수 있습니다.</Text>
        </>
      ) : uuidSet.size > 0 ? (
<>
          {showMsgBox && (

            <MessageBox
              uuids={uuidSet}
              setRemainingTime={setRemainingTime}
              setShowMsgBox={setShowMsgBox}
              // fadeInAndMoveUp={fadeInAndMoveUp}
              visible={showMsgBox}
              onClose={() => setShowMsgBox(false)}
            />
          )}
          <View ref={bottomSubContainerRef} style={styles.bleBottomSubContainer}>
            <Text style={styles.findTextSmall}>주위 {uuidSet.size}명의 인연을 찾았습니다!</Text>
            <MessageGif setShowMsgBox={setShowMsgBox} />
          </View>
        </>
      ) : (
        <View style={styles.bleBottomSubContainer}>
          <Text style={styles.findText}>주위의 인연을 찾고 있습니다.</Text>
        </View>
      )}
    </View>
  );
};

export default BleBottomComponent;

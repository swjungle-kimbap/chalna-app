import AlarmCardRender from './AlarmCardRender';
import { FlatList, Modal, StyleSheet, TouchableWithoutFeedback, View }from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import Button from '../common/Button';
import { useRecoilState } from 'recoil';
import { AlarmCountState } from '../../recoil/atoms';
import { userMMKVStorage } from '../../utils/mmkvStorage';
import { MatchFCM } from '../../interfaces/ReceivedFCMData.type';
import { useMMKVObject } from 'react-native-mmkv';
import Text from '../common/Text';

export interface AlarmModalProps{
  closeModal: () => void,
  modalVisible: boolean,
  notificationId: string,
}

const remainTime = new Map<string, number>();
const TimeoutID = new Map<string, NodeJS.Timeout>();

const AlarmModal: React.FC<AlarmModalProps> = ({modalVisible, closeModal, notificationId}) => {
  const [expandedCardId, setExpandedCardId] = useState<string>(notificationId);
  const [alarmCnt, setAlarmCnt] = useRecoilState(AlarmCountState);
  const [FCMAlarms, setFCMAlarms] = useMMKVObject<MatchFCM[]>("matchFCMStorage", userMMKVStorage);


  useEffect(() => {
    setExpandedCardId(notificationId ? notificationId : "");
  }, [notificationId]);

  useEffect(() => {
    let ignoreflg = false;
    const now = Date.now();
    if (FCMAlarms) {
      const validAlarms = FCMAlarms.filter((alarm) => {
        if (ignoreflg) return true;
        const deleteRestTime = alarm.createdAt + 5 * 60 * 1000 - now;
        console.log(alarm.createdAt, deleteRestTime);
        if (deleteRestTime > 0) {
          ignoreflg = true
          return true;
        }
        return false;
      });

      if (validAlarms) {
        validAlarms.forEach((alarm) => {
          if (remainTime.get(alarm.id)) return;
          const deleterestTime = alarm.createdAt + 300000 - Date.now();
          if (deleterestTime <= 0) return;
          const deleteRestTime = Math.floor((deleterestTime) / (60*1000));
          remainTime.set(alarm.id, deleteRestTime);
          let timeoutID = setInterval(() => {
            const restTime = remainTime.get(alarm.id);
            remainTime.set(alarm.id, restTime -1);
            if (restTime === 0) {
              clearInterval(TimeoutID.get(alarm.id));
              setFCMAlarms((prevAlarms) => prevAlarms?.filter(item => item.id !== alarm.id));
            }
          }, 60 * 1000);
          TimeoutID.set(alarm.id, timeoutID);
        });
      } 
      setFCMAlarms(validAlarms);
      setAlarmCnt(validAlarms.length);
    }
    return () => {
      for (const timeoutId of Object.values(TimeoutID)) {
        clearTimeout(timeoutId);
      }
      TimeoutID.clear();
    }
  }, [FCMAlarms, setFCMAlarms]);

  useFocusEffect(
    useCallback(() => {
      closeModal();
    }, [])
  );

  const handleCardPress = (notificationId: string) => {
    setExpandedCardId(expandedCardId === notificationId ? "" : notificationId);
  };

  const removeAlarmItem = (notificationId:string, DeleteAll = false) => {
    if (DeleteAll) {
      setFCMAlarms([]);
      setAlarmCnt(0);
    } else if (FCMAlarms) {
      setFCMAlarms(FCMAlarms.filter(item => item.id !== notificationId));
      setAlarmCnt((prev) => prev-1);
    }
  }

  const renderAlarmCard = ({ item }: { item: MatchFCM }) => (
    <AlarmCardRender
      item={item}
      restTime={remainTime.get(item.id)}
      expandedCardId={expandedCardId}
      handleCardPress={handleCardPress}
      removeAlarmItem={removeAlarmItem}
      closeModal={closeModal}    />
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalpos}>
              <Text style={styles.headText}>인연 알림 센터</Text>
              {alarmCnt === 0 ? <Text style={styles.headText}>현재 알림이 없습니다.</Text> :
              <>
              <FlatList
                data={FCMAlarms}
                keyExtractor={(item) => item.id}
                renderItem={renderAlarmCard}
              />
              <Button title='모두 지우기' variant='sub' onPress={() => {removeAlarmItem("", true)}}
                style={styles.deleteAllButtonPos} titleStyle={{color:'#FFF'}}/> 
              </>}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  headText: {
    color:'white',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height:'70%',
  },
  modalpos: {
    position: 'absolute',
    top: 15,
    right:10,
    width:'80%',
    maxHeight: '80%',
  },
  deleteAllButtonPos: {
    paddingLeft:10,
    alignItems:'flex-start'
  }
});

export default AlarmModal;

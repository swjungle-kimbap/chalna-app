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

export interface AlarmModalProps{
  closeModal: () => void,
  modalVisible: boolean,
  notificationId: string,
}

const AlarmModal: React.FC<AlarmModalProps> = ({modalVisible, closeModal, notificationId}) => {
  const [expandedCardId, setExpandedCardId] = useState<string>(notificationId);
  const [alarmCnt, setAlarmCnt] = useRecoilState(AlarmCountState);
  const [FCMAlarms, setFCMAlarms] = useMMKVObject<MatchFCM[]>("matchFCMStorage", userMMKVStorage);

  useEffect(() => {
    setExpandedCardId(notificationId ? notificationId : "");
  }, [notificationId]);

  useEffect(() => {
    let ignoreflg = false;
    setFCMAlarms(() => FCMAlarms.filter((alarm) => {
      if (ignoreflg)
        return true;
      const [year, month, day, hour, minute, second] = alarm.createdAt.split(/[\s.:]+/).map(Number);
      const createdTime = new Date(year, month - 1, day, hour, minute, second);
      const deleteRestTime = createdTime.getTime() + 5 * 60 * 1000 - Date.now(); 
      //console.log(createdTime, deleteRestTime);

      if (deleteRestTime > 0) {
        setTimeout(() => {
          setFCMAlarms((prevAlarms) => prevAlarms.filter(item => item.id !== alarm.id));
        }, deleteRestTime);
  
        ignoreflg = true
        return true;
      } 
      return false;
    }));
    setAlarmCnt(FCMAlarms.length);

  }, [FCMAlarms]);
  
  useFocusEffect(
    useCallback(() => {
      closeModal();       // 화면이 포커스를 받을 때 모달 상태 초기화
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
      expandedCardId={expandedCardId}
      handleCardPress={handleCardPress}
      removeAlarmItem={removeAlarmItem}
    />
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
              <FlatList
                data={FCMAlarms}
                keyExtractor={(item) => item.id}
                renderItem={renderAlarmCard}
              />
              {alarmCnt === 0 ? <></> :
              <Button title='모두 지우기' variant='sub' onPress={() => {removeAlarmItem("", true)}}
                style={styles.deleteAllButtonPos} titleStyle={{color:'#FFF'}}/> }
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

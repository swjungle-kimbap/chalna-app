import { axiosGet, axiosPut } from '../../axios/axios.method';
import Config from 'react-native-config';
import { AlarmItem, AlarmListResponse } from '../../interfaces';
import AlarmCardRender from './AlarmCardRender';
import { FlatList, Modal, StyleSheet, TouchableWithoutFeedback, View }from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import Button from '../common/Button';

export interface AlarmModalProps{
  closeModal: () => void,
  modalVisible: boolean,
  notificationId: number,
}

const AlarmModal: React.FC<AlarmModalProps> = ({modalVisible, closeModal, notificationId}) => {
  const [expandedCardId, setExpandedCardId] = useState<number>(notificationId);
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);

  const handleCardPress = (notificationId: number) => {
    setExpandedCardId(expandedCardId === notificationId ? 0 : notificationId);
  };

  useFocusEffect(
    useCallback(() => {
      closeModal();       // 화면이 포커스를 받을 때 모달 상태 초기화
    }, [])
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        try {
          const fetchedData = await axiosGet<AlarmListResponse>(
                                Config.GET_MSG_LIST_URL, "알림 목록 조회");
          if (fetchedData) {
            setAlarms(fetchedData.data.data);
          }
        } catch (error) {
          console.error('Error fetching alarm data:', error);
        }
      }, 3000); // 3초마다 데이터 가져오기
    };

    //startPolling();
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [modalVisible])
  
  const removeAlarmItem = (notificationId:number, DeleteAll = false) => {
    if (DeleteAll) {
      setAlarms([]);

    } else if (alarms) {
      const newAlarmList = alarms.filter(item => item.notificationId !== notificationId);
      setAlarms(newAlarmList);
    }
  }

  const handleAllDeleteAlarm = async () => {
    try {
      await axiosPut(Config.DELETE_ALL_MSG_URL, "인연 알림 모두 지우기");
      removeAlarmItem(0, true);
    } catch (e) {
      console.error("fail: 인연 수락 요청 실패", e);
    }
  }

  const renderAlarmCard = ({ item }: { item: AlarmItem }) => (
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
                data={alarms}
                keyExtractor={(item) => item.notificationId.toString()}
                renderItem={renderAlarmCard}
              />
              <Button title='모두 지우기' variant='sub' onPress={async () => handleAllDeleteAlarm}/>
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
  },
  modalpos: {
    position: 'absolute',
    top: 15,
    right:10,
    width:'80%',
  },
});

export default AlarmModal;
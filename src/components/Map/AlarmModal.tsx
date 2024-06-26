import { axiosGet, axiosPut } from '../../axios/axios.method';
import Config from 'react-native-config';
import { AlarmItem, AlarmListResponse } from '../../interfaces';
import AlarmCardRender from './AlarmCardRender';
import { FlatList, Modal, StyleSheet, TouchableWithoutFeedback, View, AppState, AppStateStatus }from 'react-native';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { useIsFocused } from '@react-navigation/native'; 
import Button from '../common/Button';
import { useRecoilState } from 'recoil';
import { AlarmCountState } from '../../recoil/atoms';
import BackgroundTimer from 'react-native-background-timer';

export interface AlarmModalProps{
  closeModal: () => void,
  modalVisible: boolean,
  notificationId: number,
}

const AlarmModal: React.FC<AlarmModalProps> = ({modalVisible, closeModal, notificationId}) => {
  const [expandedCardId, setExpandedCardId] = useState<number>(notificationId);
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [alarmCnt, setAlarmCnt] = useRecoilState(AlarmCountState);
  const isFocused = useIsFocused(); // 화면 포커스 상태 가져오기
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const handleCardPress = (notificationId: number) => {
    setExpandedCardId(expandedCardId === notificationId ? 0 : notificationId);
  };

  useFocusEffect(
    useCallback(() => {
      closeModal();       // 화면이 포커스를 받을 때 모달 상태 초기화
    }, [])
  );

  useEffect(() => {
    const startPolling = () => {
      intervalId.current = BackgroundTimer.setInterval(async () => {
        try {
          const response = await axiosGet<AlarmListResponse>(
            Config.GET_MSG_LIST_URL); // Adjust as necessary
          if (response) {
            const fetchedData = response.data; // Adjust as necessary
            setAlarms(fetchedData.data);
            setAlarmCnt(fetchedData.data.length);
          }
        } catch (error) {
          console.error('Error fetching alarm data:', error);
        }
      }, 10000); 
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState !== 'active') {
        // 앱이 background 상태로 변경될 때 polling 중지
        if (intervalId.current !== null) {
          BackgroundTimer.clearInterval(intervalId.current);
          intervalId.current = null;
        }
      } if (nextAppState === 'active') {
        startPolling();  
      }
    };

    if (isFocused) {
      startPolling();
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => {
        if (intervalId.current !== null) {
          BackgroundTimer.clearInterval(intervalId.current);
          intervalId.current = null;
        }
        subscription.remove();
      };
    } else {
      // 화면 focus를 잃으면 polling 중지
      if (intervalId.current !== null) {
        BackgroundTimer.clearInterval(intervalId.current);
        intervalId.current = null;
      }
    }
  }, [isFocused]);

  const removeAlarmItem = (notificationId:number, DeleteAll = false) => {
    if (DeleteAll) {
      setAlarms([]);
      setAlarmCnt(0);
    } else if (alarms) {
      const newAlarmList = alarms.filter(item => item.notificationId !== notificationId);
      setAlarms(newAlarmList);
      setAlarmCnt((prev) => prev-1);
    }
  }

  const handleAllDeleteAlarm = async () => {
    await axiosPut(Config.DELETE_ALL_MSG_URL, "인연 알림 모두 지우기");
    removeAlarmItem(0, true);
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
              {alarmCnt === 0 ? <></> :
              <Button title='모두 지우기' variant='sub' onPress={async () => {handleAllDeleteAlarm()}}
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
import { axiosGet } from '../../axios/axios.method';
import Config from 'react-native-config';
import { AlarmItem, AlarmListResponse } from '../../interfaces';
import AlarmCardRender from './AlarmCardRender';
import { navigate } from '../../navigation/RootNavigation';
import { FlatList, Modal, StyleSheet, TouchableWithoutFeedback, View }from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/core';

const Alarms = {
  "code": "200",
  "data": [
      {
          "createAt": "2024-06-23T05:45:32.318738",
          "message": "push 알림",
          "senderId": "3",
          "overlapCount": "1"
      },
      {
          "createAt": "2024-06-23T05:45:32.318738",
          "message": "push 알림",
          "senderId": "3",
          "overlapCount": "1"
      },
      {
          "createAt": "2024-06-23T05:45:32.318738",
          "message": "push 알림",
          "senderId": "3",
          "overlapCount": "1"
      }
  ],
  "message": "요청 처리에 성공했습니다."
}

export interface AlarmModalProps{
  closeModal: () => void,
  modalVisible: boolean,
}


const AlarmModal: React.FC<AlarmModalProps> = ({modalVisible, closeModal}) => {
  const [expandedCardId, setExpandedCardId] = useState<string>("");
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);

  const handleCardPress = (createAt: string) => {
    setExpandedCardId(expandedCardId === createAt ? "" : createAt);
  };

  useFocusEffect(
    useCallback(() => {
      // 화면이 포커스를 받을 때 모달 상태 초기화
      closeModal();
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
  
  const navigateToChat = () => {
    navigate('채팅');
  };

  const removeAlarmItem = (createAt:string) => {
    if (alarms) {
      const newAlarmList = alarms.filter(item => item.createAt !== createAt);
      setAlarms(newAlarmList);
    }
  }

  const renderAlarmCard = ({ item }: { item: AlarmItem }) => (
    <AlarmCardRender
      item={item}
      expandedCardId={expandedCardId}
      handleCardPress={handleCardPress}
      navigate={navigateToChat}
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
                data={Alarms?.data ?? []}
                keyExtractor={(item) => item.createAt}
                renderItem={renderAlarmCard}
              />
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
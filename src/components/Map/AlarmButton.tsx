import Button from '../common/Button'
import RoundBox from '../common/RoundBox';
import { FlatList, Modal, StyleSheet, TouchableWithoutFeedback, View }from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import FontTheme from "../../styles/FontTheme";
import { useFocusEffect } from '@react-navigation/core';
import { axiosGet } from '../../axios/axios.method';
import Config from 'react-native-config';
import { GetAlarmData, AlarmItem } from '../../interfaces';
import AlarmCardRender from './AlarmCardRender';
import { navigate } from '../../navigation/RootNavigation';

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

const AlarmModal = ({ visible, onClose }:{ visible: boolean, onClose: () => void }) => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [alarms, setAlarms] = useState<AlarmItem[] | null>(null);

  const handleCardPress = (cardId: number) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        try {
          const fetchedData = await axiosGet<GetAlarmData>(Config.GET_MSG_LIST_URL, "알림 목록 조회");
          if (fetchedData) {
            setAlarms(fetchedData.data);
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
  }, [visible])

  const navigateToChat = () => {
    navigate('채팅');
  };

  const removeAlarmItem = ({idx}) => {
    if (alarms) {
      const newAlarmList = alarms.filter(item => item.idx !== idx);
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
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalpos}>
              <FlatList
                data={Alarms?.data ?? []}
                keyExtractor={(item) => item.createAt.toString()}
                renderItem={renderAlarmCard}
              />
              <Button title="Close" onPress={onClose} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const AlarmButton = () => {
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // 화면이 포커스를 받을 때 모달 상태 초기화
      closeModal();
    }, [])
  );

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  return (
    <>
    <AlarmModal visible={modalVisible} alarms={Alarms} onClose={closeModal}/>
    <RoundBox style={styles.buttonContainer}>
      <Button iconSource={require('../../assets/Icons/AlarmIcon.png')}
        imageStyle={{
          width:30,
          height:30,}}
        onPress={openModal}></Button>
    </RoundBox>
    </>
  );
}

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
  modalContent: {
    width: '100%',
    padding: 13,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  alarmCnt: {
    fontSize:10,
    marginBottom:5,
    fontFamily: FontTheme.fonts.title,
    color: '#979797',
  },
  alarmContent: {
    fontSize: 14,
    textAlign: 'left',  
    width: '100%', 
    fontFamily: FontTheme.fonts.main,
    color: '#060606',
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    position: 'absolute',
    top: 20,
    right: 10,
    zIndex: 2,
  },
});


export default AlarmButton;
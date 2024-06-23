import Button from '../common/Button'
import RoundBox from '../common/RoundBox';
import { Text, FlatList, Modal, StyleSheet, TouchableWithoutFeedback, View, TouchableOpacity } from 'react-native';
import { useCallback, useState } from 'react';
import FontTheme from "../../styles/FontTheme";
import { navigate } from '../../navigation/RootNavigation';
import { useFocusEffect } from '@react-navigation/core';

const Alarms = [
  {idx:1, content:"메세지 내용을 아세요?. 메세지 내용입니다. 메세지 내용입니다. 메세지 내용입니다. 메세지 내용입니다. 메세지 내용입니다. 메세지 내용입니다.", cnt: 1, tag:"없음"},
  {idx:2, content:"메세지 내용입니다.", cnt: 8, tag:"없음"},
  {idx:3, content:"메세지 내용입니다.", cnt: 3},
  {idx:4, content:"메세지 내용입니다.", cnt: 6},
  {idx:5, content:"메세지 내용입니다.", cnt: 4},
]

const AlarmModal = ({ visible, alarms, onClose }) => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const handleCardPress = (cardId: number) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  const AlarmCardRender = ({ item }) => (
    <TouchableOpacity onPress={() => handleCardPress(item.idx)}>
      <View style={styles.modalContent}>
        <Text style={styles.alarmCnt}>{`${item.cnt}번 스쳐간 인연입니다.`}</Text>
        {expandedCardId === item.idx ? (
          <>
            <Text 
              numberOfLines={5}
              ellipsizeMode="tail"
              style={styles.alarmContent}
            >
              {item.content}
            </Text>
            <View style={styles.btnContainer}>
              <Button style={{flex:1}} variant="sub" title="대화하기" onPress={() => navigate('채팅')} />
              <Button style={{flex:1}} variant="sub" title="지우기" onPress={() => { /* 지우기 기능 추가 */ }} />
            </View>
          </>
        ) : (
          <Text 
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.alarmContent}
          >
            {item.content}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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
                data={alarms}
                keyExtractor={(item) => item.idx.toString()}
                renderItem={AlarmCardRender}
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
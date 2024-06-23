import Button from '../common/Button'
import RoundBox from '../common/RoundBox';
import { StyleSheet }from 'react-native';
import FontTheme from "../../styles/FontTheme";
import AlarmModal from './AlarmModal';
import { useState } from 'react';

const AlarmButton = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  return (
    <>
    <AlarmModal modalVisible={modalVisible} closeModal={closeModal}/>
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
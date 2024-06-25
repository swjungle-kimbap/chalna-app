import Button from '../common/Button'
import RoundBox from '../common/RoundBox';
import { StyleSheet }from 'react-native';
import FontTheme from "../../styles/FontTheme";
import AlarmModal from './AlarmModal';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { AlarmCountState } from '../../recoil/atoms';
import Text from '../common/Text';

interface AlarmButtonPrams {
  notificationId : number
}

const AlarmButton : React.FC<AlarmButtonPrams> = ({notificationId}) => {
  const [modalVisible, setModalVisible] = useState(notificationId ? true : false);
  const alarmCount = useRecoilValue(AlarmCountState);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  return (
    <>
    <AlarmModal modalVisible={modalVisible} closeModal={closeModal} 
      notificationId = {notificationId}/>
    <RoundBox style={styles.buttonContainer}>
      <Button iconSource={require('../../assets/Icons/AlarmIcon.png')}
        imageStyle={{
          width:30,
          height:30}}
        onPress={openModal}></Button>
    </RoundBox>
    {alarmCount > 0 && ( 
        <RoundBox style = {styles.badgeConatiner}>
          <Text style = {styles.badgeText}>
            {alarmCount < 99 ? alarmCount : '99'}
          </Text>
        </RoundBox>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  badgeConatiner: {
    backgroundColor: 'red',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
    right: 15,
    height: 20, // 너비와 높이 동일하게 설정
    width: 20,
    borderRadius: 20, 
    paddingVertical: 2, // 상하 여백 설정
    paddingHorizontal: 3, // 좌우 여백 설정
    zIndex:3
  },
  badgeText:{
    top: 0,
    right: 0,
    color: 'white', // 글자색 설정
    fontSize:10,
  },
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
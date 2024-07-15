import Button from '../common/Button'
import RoundBox from '../common/RoundBox';
import { StyleSheet }from 'react-native';
import AlarmModal from './AlarmModal';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { AlarmCountState } from '../../recoil/atoms';
import Text from '../common/Text';
import color from '../../styles/ColorTheme';

interface AlarmButtonPrams {
  notificationId : string
}

const AlarmButton : React.FC<AlarmButtonPrams> = ({notificationId}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const alarmCount = useRecoilValue(AlarmCountState);
  
  useEffect(() => {
    setModalVisible(notificationId ? true : false);
  }, [notificationId]);

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
          height:30,
          tintColor:color.colors.main,
        }}
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
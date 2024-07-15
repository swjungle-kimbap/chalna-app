import RoundBox from "../../components/common/RoundBox";
import Button from '../../components/common/Button';
import {StyleSheet} from 'react-native';
import LocalChatModal from "./LocalChatModal";
import { handleCheckPermission } from "../../service/LocalChat";
import color from "../../styles/ColorTheme";

const LocalChatButton = ({showLocalChatModal, setShowLocalChatModal}) => {

  const openModal = () => {
    const success = handleCheckPermission();
    if (success)
      setShowLocalChatModal(true);
  };

  const closeModal = () => {
    setShowLocalChatModal(false);
  };


  return (
    <>
      <LocalChatModal closeModal={closeModal} modalVisible={showLocalChatModal}/>
      <RoundBox style={styles.localChatButton}>
        <Button
          iconSource={require('../../assets/buttons/AddLocalChatButton.png')}
          imageStyle={styles.buttonImage}
          onPress={openModal}
        />
      </RoundBox>
    </>
  );
};

const styles = StyleSheet.create({
  localChatButton : {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
    right: 20,
    height: 70, 
    width: 70,
    borderRadius: 35, 
    paddingVertical: 2, // 상하 여백 설정
    paddingHorizontal: 3, // 좌우 여백 설정
    zIndex:3,
    backgroundColor: color.colors.main,
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {
      width: 0,
      height: 2,
    }, // 그림자의 오프셋 설정
    shadowOpacity: 0.8, // 그림자의 투명도 설정
    shadowRadius: 8, // 그림자의 번지는 반경 설정
    elevation: 10, // 안드로이드에서 그림자 효과를 주기 위해 필요한 속성
  },
  buttonImage: {
    width: 45,
    height: 45,
    tintColor: 'white'
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderColor: '#000',
    color: '#FFF',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  tutorialContainer: {
    position: 'absolute',
    bottom: 110,
    right: 30,
    alignItems: 'center',
  }

})

export default LocalChatButton;
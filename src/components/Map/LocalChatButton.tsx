import RoundBox from "../../components/common/RoundBox";
import Button from '../../components/common/Button';
import { StyleSheet } from 'react-native';
import { useState } from "react";
import LocalChatModal from "./LocalChatModal";
import { handleCheckPermission } from "../../service/LocalChat";

const LocalChatButton = () => {
  const [showLocalChatModal, setShowLocalChatModal] = useState<boolean>(false);

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
    right: 80,
    height: 50, 
    width: 50,
    borderRadius: 30, 
    paddingVertical: 2, // 상하 여백 설정
    paddingHorizontal: 3, // 좌우 여백 설정
    zIndex:3
  },
  buttonImage: {
    width: 35,
    height: 35,
    tintColor: '#979797'
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
})

export default LocalChatButton;
import { Modal, StyleSheet, TextInput, TouchableWithoutFeedback, View, TouchableOpacity, Image } from 'react-native';
import { useRef, useState } from 'react';
import Button from '../common/Button';
import Text from '../common/Text';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getLocalChatRefreshState, locationState } from '../../recoil/atoms';
import { makeLocalChat } from '../../service/LocalChat';
import FastImage from 'react-native-fast-image';
import { handleImagePicker } from '../../utils/FileHandling';
import RNFS from 'react-native-fs';
import fontTheme from '../../styles/FontTheme';
import { useModal } from '../../context/ModalContext';
import colorTheme from '../../styles/ColorTheme';


export interface LocalChatModalProps {
  closeModal: () => void,
  modalVisible: boolean,
}

const LocalChatModal: React.FC<LocalChatModalProps> = ({ modalVisible, closeModal }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const currentLocation = useRecoilValue(locationState);
  const [refresh, setRefresh] = useRecoilState(getLocalChatRefreshState);
  const inputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [image, setImage] = useState(null);
  const { showModal } = useModal();

  const handleCreateButton = async () => {
    const localChat = await makeLocalChat(name, description, currentLocation, image);
    if (localChat) {
      setRefresh(prev => !prev);
      setImageUrl("");
      closeModal();
    }
  }

  const handleSelectImage = async () => {
    const selectedImage = await handleImagePicker();
    if (selectedImage) {
      setImageUrl(selectedImage.uri);
      setImage(selectedImage);
    }
  }

  const handleRemoveImage = () => {
    if (image?.uri) {
      RNFS.unlink(image.uri);
    }
    setImageUrl('');
    setImage(null);
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
      onShow={() => inputRef.current?.focus()}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.inputBoxPos}>
                <View style={styles.headerContainer}>
                  <Text style={styles.titleText}>장소 채팅 생성</Text>
                  <TouchableOpacity style={styles.questionIconContainer} onPress={() => showModal("장소 대화방", "현재 위치에서 주위 사람들과의 대화방을 만들어 보세요! \n 50m 이내의 사람들만 참여할 수 있어요!", () => {}, undefined, false)}>
                    <Image source={require('../../assets/Icons/Question2.png')} style={styles.questionIcon} />
                  </TouchableOpacity>
                </View>

                {!imageUrl && (
                  <TouchableOpacity onPress={handleSelectImage} style={styles.imageButton}>
                    <Image source={require('../../assets/photo.png')} style={styles.imageIcon} />
                  </TouchableOpacity>
                )}

                {imageUrl && (
                  <View style={styles.imageContainer}>
                    <FastImage
                      style={styles.smallImage}
                      source={{ uri: imageUrl, priority: FastImage.priority.normal }}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                    <TouchableOpacity onPress={handleRemoveImage} style={styles.removeImageButton}>
                      <Text style={styles.removeImageButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.outlinedInput}>
                  <TextInput
                    value={name}
                    style={styles.textInput}
                    onChange={(event) => setName(event.nativeEvent.text)}
                    placeholder="제목을 입력해주세요"
                    ref={inputRef}
                    maxLength={15}
                    blurOnSubmit={false}
                    onSubmitEditing={() => descriptionInputRef.current?.focus()}
                  />
                  {name.length > 0 && (
                    <TouchableOpacity onPress={() => setName('')}>
                      <Image source={require('../../assets/buttons/CloseButton.png')} style={styles.closebutton} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.outlinedInput}>
                  <TextInput
                    value={description}
                    style={styles.textInput}
                    multiline
                    maxLength={30}
                    onChange={(event) => setDescription(event.nativeEvent.text)}
                    placeholder="무엇을 공유하나요? 내용을 입력해주세요"
                    ref={descriptionInputRef}
                  />
                  {description.length > 0 && (
                    <TouchableOpacity onPress={() => setDescription('')}>
                      <Image source={require('../../assets/buttons/CloseButton.png')} style={styles.closebutton} />
                    </TouchableOpacity>
                  )}
                </View>

                {(name.length > 0 && description.length > 0) ? (
                  <Button titleStyle={styles.makeButton} title="생성하기" onPress={handleCreateButton} />
                ) : (
                  <Button disabled titleStyle={styles.disableButton} title=
                  {name.length === 0 && description.length === 0 ? "제목과 내용을 채워주세요" : name.length === 0 ? "제목을 입력해주세요" : "내용을 입력해주세요"}
                  onPress={handleCreateButton} />
                )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBoxPos: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 10,
  },
  inputBox: {
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionIconContainer: {
    position: 'absolute',
    right: 0,
  },
  questionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  outlinedInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: colorTheme.colors.light_sub,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    color: 'black',
    width: '100%',
    margin: 0,
    padding: 0,
    fontFamily: fontTheme.fonts.sub,
    backgroundColor: 'transparent',
  },
  closebutton: {
    width: 13,
    height: 13,
    tintColor: 'black',
  },
  imageButton: {
    alignSelf: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 10,
  },
  imageIcon: {
    width: 30,
    height: 30,
    tintColor: 'gray',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: 200,
  },
  smallImage: {
    width: 150,
    height: 150,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: 'white',
    fontSize: 18,
  },
  makeButton: {
    fontSize: 17,
    marginTop: 10,
    width: '100%',
    textAlign: 'center',
    backgroundColor: colorTheme.colors.main,
    alignSelf: 'center',
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    color: 'white'
  },
  disableButton: {
    fontSize: 17,
    marginTop: 10,
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#E9E9E9',
    alignSelf: 'center',
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    color: 'white'
  },
  makeExplain: {
    fontSize: 15,
    marginVertical: 10,
  }
});

export default LocalChatModal;

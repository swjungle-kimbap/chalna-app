import { Alert, Modal, StyleSheet, TextInput, TouchableWithoutFeedback, View, }from 'react-native';
import { useRef, useState } from 'react';
import Button from '../common/Button';
import Text from '../common/Text';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getLocalChatRefreshState, locationState } from '../../recoil/atoms';
import { makeLocalChat } from '../../service/LocalChat';
import FastImage from 'react-native-fast-image';
import { handleImagePicker } from '../../utils/FileHandling';

export interface LocalChatModalProps{
  closeModal: () => void,
  modalVisible: boolean,
}

const LocalChatModal: React.FC<LocalChatModalProps> = ({modalVisible, closeModal}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const currentLocation = useRecoilValue(locationState);
  const [refresh, setRefresh] = useRecoilState(getLocalChatRefreshState);
  const inputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const [imageUrl, setImageUrl] = useState(""); 
  const [image, setImage] = useState(null); 

  const handleCreateButton = async () => {
    const localChat = await makeLocalChat(name, description, currentLocation, image)
     if (localChat) {
      setRefresh(prev => !prev);
      closeModal();
     }
  }

  const handleSelectImage = async () => {
    const image = await handleImagePicker();
    if (image) {
      setImageUrl(image.uri);
      setImage(image);
    }
  }

  const handleRemoveImage = () => {
    setImageUrl('');
    setImage(null);
  };
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
      onShow={() => inputRef.current?.focus()}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.inputBoxPos}>
            <TouchableWithoutFeedback>
              <View style={styles.inputBox}>
                <Text style={styles.titleText}>장소 채팅 생성 <Button title='💬' onPress={
                  () => {Alert.alert("장소 대화방","현재 위치에서 주위 사람들과의 대화방을 만들어 보세요! 50m 이내의 사람들만 참여할 수 있어요!")}
                }/></Text>
                <Button variant='sub' title='사진 추가 🖼️' onPress={handleSelectImage} titleStyle={styles.photoButton}/> 
                <View style={styles.outlinedInput}>
                  {imageUrl &&
                    <>
                    <FastImage
                      style={styles.fullScreenImage}
                      source={{ uri: imageUrl, priority: FastImage.priority.normal }}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                    <Button iconSource={require('../../assets/buttons/CloseButton.png')} imageStyle={styles.photoRemoveButton}
                      onPress={handleRemoveImage}/>
                    </>
                  }
                  <TextInput
                    value={name}
                    style={styles.textInput}
                    onChange={(event) => setName(event.nativeEvent.text)}
                    placeholder="제목을 입력해주세요"
                    placeholderTextColor="#888"
                    ref={inputRef}
                    maxLength={15}
                    blurOnSubmit={false}
                    onSubmitEditing={() => descriptionInputRef.current?.focus()} 
                  />
                  <Button iconSource={require('../../assets/buttons/CloseButton.png')} imageStyle={styles.closebutton}
                    onPress={() => {setName('');}}/>
                </View>
                <View style={styles.outlinedInput}>
                  <TextInput
                    value={description}
                    style={styles.textInput}
                    multiline
                    maxLength={30}
                    onChange={(event) => setDescription(event.nativeEvent.text)}
                    placeholder="내용을 입력해주세요"
                    placeholderTextColor="#888"
                    ref={descriptionInputRef}
                  />
                  <Button iconSource={require('../../assets/buttons/CloseButton.png')} imageStyle={styles.closebutton}
                    onPress={() => {setDescription('');}}/>
                </View>
                { ( name.length > 0 && description.length > 0) ? 
                  <Button titleStyle={styles.makeButton} title="만들기" onPress={handleCreateButton}/> :
                  name.length !== 0 ? <Text style={styles.makeButton} variant='sub'>내용을 입력해주세요</Text> : 
                  description.length !== 0 ? <Text style={styles.makeButton} variant='sub'>제목을 입력해주세요</Text> : 
                  <Text style={styles.makeButton} variant='sub'>제목과 내용을 채워주세요</Text> }
                
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  makeButton: {
    fontSize: 15,
    marginVertical:10,
  },
  photoRemoveButton: {
    position: 'relative',
    width: 13,
    height: 13,
    bottom: 20,
  },
  closebutton: {
    width: 13,
    height: 13,
    color: 'black',
  },
  photoButton: {
    alignSelf: 'flex-start',
    fontSize: 15,
  },
  fullScreenImage: {
    width: 60,
    height: 60,
  },
  textInput: {
    flex: 1,
    color: 'black',
    width: '100%',
    margin:0,
    padding:0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: '70%',
  },
  inputBox: {
    width: '80%',
    maxHeight: '70%',
    zIndex: 3,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  inputBoxPos: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'left', 
    marginVertical: 10,
    fontSize: 20,
  },
  outlinedInput: {
    borderBottomWidth: 1,
    borderColor: '#000',
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default LocalChatModal;
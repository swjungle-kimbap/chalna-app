import { Alert, Modal, StyleSheet, TextInput, TouchableWithoutFeedback, View, }from 'react-native';
import { useRef, useState } from 'react';
import Button from '../common/Button';
import Text from '../common/Text';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getLocalChatRefreshState, locationState } from '../../recoil/atoms';
import { makeLocalChat } from '../../service/LocalChat';

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

  const handleCreateButton = async () => {
    const localChat = await makeLocalChat(name, description, currentLocation)
     if (localChat) {
      setRefresh(prev => !prev);
      setName("");
      setDescription("");
      closeModal();
     }
  }

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
                <Text style={styles.subText} variant='sub'>제목</Text>
                <TextInput
                  value={name}
                  style={[styles.textInput, styles.outlinedInput]}
                  onChange={(event) => setName(event.nativeEvent.text)}
                  placeholder="제목을 입력해주세요"
                  placeholderTextColor="#888"
                  ref={inputRef}
                  blurOnSubmit={false}
                  onSubmitEditing={() => descriptionInputRef.current?.focus()} 
                />
                <Text style={styles.subText} variant='sub'>내용</Text>
                <TextInput
                  value={description}
                  style={[styles.textInput, styles.outlinedInput]}
                  numberOfLines={3}
                  multiline
                  onChange={(event) => setDescription(event.nativeEvent.text)}
                  placeholder="내용을 입력해주세요"
                  placeholderTextColor="#888"
                  ref={descriptionInputRef}
                />
                <Button
                  title="이곳에 만들기"
                  onPress={handleCreateButton}
                  style={{paddingVertical:3}}
                />
              </View>
            </TouchableWithoutFeedback>
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
    height: '70%',
  },
  subText: {
    alignSelf: 'flex-start',
    fontSize: 15,
    marginBottom: 5,
    paddingLeft: 5,
  },
  inputBox: {
    width: '80%',
    maxHeight: '70%',
    zIndex: 3,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  inputBoxPos: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'left', 
    marginBottom: 10,
    fontSize: 20,
  },
  textInput: {
    width: '100%',
    color: '#333',
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  outlinedInput: {
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default LocalChatModal;
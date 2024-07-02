import { Modal, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import HorizontalLine from './HorizontalLine';
import FontTheme from '../../styles/FontTheme';
import { useState } from 'react';
import Text from '../common/Text';
import Button from "../../components/common/Button";

const EditModal = ({ value, setValue, modalVisible, closeModal, maxLength }) => {
  const [inputText, setInputText] = useState(value);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.inputBoxPos}>
            <TouchableWithoutFeedback>
              <>
                <Text style={styles.countText}>{`[${inputText ? inputText.length: 0}/${maxLength}]`}</Text>
                <HorizontalLine style={styles.horizon}/>
                <TextInput
                  style={styles.inputBox}
                  value={inputText}
                  onChangeText={setInputText}
                  maxLength={maxLength}
                />
                <HorizontalLine style={styles.horizon}/>
              </>
            </TouchableWithoutFeedback>
            <View style={styles.buttonContainer}>
              <Button title="비우기"titleStyle={styles.countText} onPress={() => setInputText("")}/>
              <Button title="저장" titleStyle={styles.countText} onPress={() => {setValue(inputText); closeModal();} }/>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-evenly'
  },
  closeButton: {
    width: 16,
    height: 16,
    color: '#979797',
  },
  countText:{
    fontSize: 15,
    color: '#fff',
    paddingTop: 10,
  },
  horizon: {
    color: '#979797',
    marginVertical: 0, 
    borderBottomWidth: 2, 
  },
  inputBox: {
    fontSize: 15,
    color: '#fff',
    fontFamily: FontTheme.fonts.main,
    textAlign:'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',  
    alignItems: 'center',
  },
  inputBoxPos: {
    width: '80%',  
    textAlign:'center',
  },
  innerContainer: {
    width: '100%',
    backgroundColor: '#444',
    padding: 20,
    borderRadius: 10,
  },
});
export default EditModal;
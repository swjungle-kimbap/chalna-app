import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useModal } from '../../context/ModalContext'; // Adjust the import path as necessary

const BackgroundNonDismissibleModal = () => {
  const { modalVisible, modalContent, hideModal } = useModal();

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {}}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{modalContent.title}</Text>
          <Text style={styles.modalText}>{modalContent.content}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => { modalContent.onCancel(); hideModal(); }}>
              <Text style={styles.buttonCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={() => { modalContent.onConfirm(); hideModal(); }}>
              <Text style={styles.buttonConfirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    // padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: 10,
    fontSize: 20,
    // padding:10,
    marginTop:20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
    padding: 15,
    marginLeft:10,
    marginRight:10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 15, 
    alignItems: 'center',
    borderRadius: 0,
  },
  cancelButton: {
    backgroundColor: '#BDBDBD',
    marginRight: 0,
    borderBottomLeftRadius: 10
  },
  confirmButton: {
    backgroundColor: '#6DB9C4',
    marginLeft: 0,
    borderBottomRightRadius: 10
  },
  buttonConfirmText: {
    color: 'white',
    fontSize: 16,
  },
  buttonCancelText: {
    color: 'gray',
    fontSize: 16
  }
});

export default BackgroundNonDismissibleModal;

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Image } from 'react-native';
import { useModal } from '../../context/ModalContext'; // Adjust the import path as necessary
import fontTheme from '../../styles/FontTheme';
import colorTheme from '../../styles/ColorTheme';

const BackgroundNonDismissibleModal = () => {
  const { modalVisible, modalContent, hideModal } = useModal();

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={hideModal}
    >
      <TouchableWithoutFeedback onPress={modalContent.dismissOnBackgroundClick ? hideModal : undefined}>
        <View style={[
          styles.modalContainer,
          modalContent.showBackground === false && styles.noBackground
        ]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[
              styles.modalContent,
              modalContent.position === 'top' ? styles.modalContentTop : styles.modalContentCenter,
            ]}>
            
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
              {modalContent.imageUri && (
                <Image source={{ uri: modalContent.imageUri }} style={styles.modalImage} />
              )}
              <Text style={styles.modalText}>{modalContent.content}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    !modalContent.showCancel && styles.confirmButtonSingle
                  ]}
                  onPress={() => { modalContent.onConfirm && modalContent.onConfirm(); hideModal(); }}
                >
                  <Text style={styles.buttonConfirmText}>{modalContent.confirmText || '확인'}</Text>
                </TouchableOpacity>
                {modalContent.showCancel && (
                  <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => { modalContent.onCancel && modalContent.onCancel(); hideModal(); }}>
                    <Text style={styles.buttonCancelText}>{modalContent.cancelText || '취소'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  noBackground: {
    backgroundColor: 'transparent',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -150 }],
  },
  modalContentTop: {
    top: 50,
  },
  modalContentCenter: {
    top: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  modalTitle: {
    marginBottom: 10,
    fontSize: 14,
    marginTop: 20,
    fontFamily: fontTheme.fonts.title,
    color: 'black'
  },
  modalText: {
    marginBottom: 20,
    fontSize: 15,
    padding: 15,
    marginLeft: 10,
    marginRight: 10,
    textAlign: 'center',
    fontFamily: fontTheme.fonts.main,
    color: 'black'
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
    backgroundColor: '#D9D9DA',
    marginRight: 0,
    borderBottomRightRadius: 10
  },
  confirmButton: {
    backgroundColor: colorTheme.colors.main,
    marginLeft: 0,
    borderBottomLeftRadius: 10,
  },
  confirmButtonSingle: {
    borderBottomEndRadius: 10,
  },
  buttonConfirmText: {
    color: 'white',
    fontSize: 13,
    fontFamily: fontTheme.fonts.title,
  },
  buttonCancelText: {
    color: '#666666',
    fontSize: 13,
    fontFamily: fontTheme.fonts.title,
  },
});

export default BackgroundNonDismissibleModal;

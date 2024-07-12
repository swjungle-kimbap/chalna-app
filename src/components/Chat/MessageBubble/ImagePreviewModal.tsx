import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';
import ImageTextButton from "../../common/Button";
import FastImage, { Source } from 'react-native-fast-image';

interface ImagePreviewModalProps {
    visible: boolean;
    onClose: () => void;
    imageUrl: string;
    onDownload: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
                                                                 visible, onClose, imageUrl, onDownload
                                                             }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <FullScreenModalContainer>
                <FullScreenModalContent>
                    <ImageTextButton
                        iconSource={require('../../../assets/Icons/closeIcon.png')}
                        imageStyle={{ height: 15, width: 15, marginRight: 10, marginTop: 10 }}
                        onPress={onClose}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    <FastImage
                        source={{ uri: imageUrl }}
                        style={styles.fullScreenImage}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                    <ImageTextButton
                        iconSource={require('../../../assets/Icons/Download.png')}
                        imageStyle={{ height: 20, width: 20 }}
                        onPress={onDownload}
                    />
                </FullScreenModalContent>
            </FullScreenModalContainer>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenImage: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
    },
});

const FullScreenModalContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.9);
`;

const FullScreenModalContent = styled.View`
    width: 90%;
    height: 90%;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    align-items: center;
`;

export default ImagePreviewModal;

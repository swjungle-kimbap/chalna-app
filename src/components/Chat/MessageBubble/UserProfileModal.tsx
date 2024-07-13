import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import Text from '../../common/Text';
import ImageTextButton from "../../common/Button";
import FastImage, { Source } from 'react-native-fast-image';

interface UserProfileModalProps {
    visible: boolean;
    onClose: () => void;
    username?: string;
    profilePicture?: string;
    chatRoomType: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
                                                               visible, onClose, username, profilePicture, chatRoomType
                                                           }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <ModalContainer>
                <ModalContent>
                    <ImageTextButton
                        iconSource={require('../../../assets/Icons/closeIcon.png')}
                        imageStyle={{ height: 15, width: 15 }}
                        onPress={onClose}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    {profilePicture ? (
                        <FastImage
                            style={styles.profilePictureModal}
                            source={{ uri: profilePicture, priority: FastImage.priority.normal } as Source}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                    ) : (
                        <FastImage
                            source={require('../../../assets/images/anonymous.png')}
                            style={styles.profilePictureModal}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                    )}
                    <NameBtnContainer>
                        <Text variant="subtitle">{username}</Text>
                        {chatRoomType === 'FRIEND' ? (
                            <FastImage
                                source={require('../../../assets/Icons/friendIcon.png')}
                                style={{ height: 18, width: 24, marginLeft: 6, marginTop: 7 }}
                                resizeMode={FastImage.resizeMode.stretch}
                            />
                        ) : (
                            <ImageTextButton
                                style={{ marginTop: 1, marginLeft: 5 }}
                                iconSource={require('../../../assets/Icons/AddFriendCircle.png')}
                                imageStyle={{ height: 25, width: 25 }}
                            />
                        )}
                    </NameBtnContainer>
                    <Text variant="sub" style={{ size: 12, marginBottom: 10 }}>
                        {"스쳐간 횟수 or 상태메세지 표기"}
                    </Text>
                </ModalContent>
            </ModalContainer>
        </Modal>
    );
};

const styles = StyleSheet.create({
    profilePictureModal: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
});

const ModalContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
    width: 80%;
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    align-items: center;
`;

const NameBtnContainer = styled.View`
    margin-top: 10px;
    margin-bottom: 5px;
    flex-direction: row;
`;

export default UserProfileModal;

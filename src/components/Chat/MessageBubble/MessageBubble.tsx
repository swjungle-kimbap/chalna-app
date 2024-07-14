import React, { useState, useCallback, memo } from 'react';
import { TouchableOpacity, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import styled from 'styled-components/native';
import FastImage from 'react-native-fast-image';
import Text from '../../common/Text';
import ImageTextButton from "../../common/Button";
import RNFS from 'react-native-fs';
import FriendRequestActions from './FriendRequestActions';
import ImagePreviewModal from "./ImagePreviewModal";
import UserProfileModal from "./UserProfileModal";
import ProfileImage from '../../common/ProfileImage';
import { useModal } from '../../../context/ModalContext';

interface MessageBubbleProps {
    message: any;
    datetime: string;
    isSelf: boolean;
    type?: string;
    unreadCnt?: number;
    senderId: number;
    chatRoomId: number;
    chatRoomType: string;
    profilePicture?: string;
    username?: string;
    showProfileTime?: boolean;
    isViewable?:boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = memo(({
                                                              message, datetime, isSelf, type, unreadCnt, senderId, chatRoomId,
                                                              chatRoomType, profilePicture, username, showProfileTime
                                                              , isViewable
                                                          }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [isDisabled, setIsDisabled] = useState(chatRoomType === 'FRIEND');
    // const resizedImageUri = useRef(message.preSignedUrl);
    const {showModal} = useModal();

    const toggleUserInfoModal = useCallback(() => {
        setModalVisible(prev => !prev);
    }, []);

    const toggleImageModal = useCallback(() => {
        setImageModalVisible(prev => !prev);
    }, []);

    const renderMessageContent = () => {
        if (typeof message === 'string') {
            return <Text variant="sub" style={styles.messageText}>{message}</Text>;
        } else if (type === 'FILE' && message.preSignedUrl) {
            // if (!isViewable) return null;
            return (
                <TouchableOpacity onPress={toggleImageModal}>
                    <FastImage
                        source={{ uri: message.preSignedUrl }}
                        style={styles.messageImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </TouchableOpacity>
            );
        } else if (typeof message==='object'){
            return (
                <Text variant="sub" style={{ color: "#444444" }}>{JSON.stringify(message)}</Text>
            )
        }
        return null;
    };

    const handleFileDownload = async () => {
        try {
            const hasPermission = await requestExternalStoragePermission();

            if (!hasPermission) {

                showModal('권한 오류', '외부 저장소 접근 권한이 필요합니다.',()=>{},undefined,false);

                return;
            }

            const { preSignedUrl } = message;
            const path = `${RNFS.ExternalStorageDirectoryPath}/DCIM/Camera`;
            const downloadDest = `${path}/chalna_${message.fileId}_${Date.now()}_sd.jpg`;

            const directoryExists = await RNFS.exists(path);

            if (!directoryExists) {
                try {
                    await RNFS.mkdir(path, { NSURLIsExcludedFromBackupKey: true });
                } catch (error) {
                    showModal('디렉토리 생성 오류', '디렉토리 생성에 실패했습니다.',()=>{},undefined,false);
                    return;
                }
            }

            const downloadOptions = { fromUrl: preSignedUrl, toFile: downloadDest };
            const res = RNFS.downloadFile(downloadOptions);
            const result = await res.promise;
            console.log('결과 :',result.statusCode);
            if (result.statusCode === 200) {
                try {
                    await RNFS.scanFile(downloadDest);
                    showModal('이미지 저장','이미지를 저장했습니다.',()=>{},undefined,false);
                } catch (moveError) {
                    showModal('이미지 저장 실패','이미지를 저장하는데 실패했습니다.',()=>{},undefined,false);
                }
            } else if (result.statusCode === 403) {
                showModal('다운로드 실패','만료기간이 지났습니다.',()=>{},undefined,false);
            } else {

                showModal('다운로드 실패','이미지를 다운로드 하는데 실패했습니다.',()=>{},undefined,false);
            }
        } catch (error) {
            console.log(error);
            showModal('다운로드 실패','이미지를 다운로드 하는데 실패했습니다.',()=>{},undefined,false);
        }
    };

    const requestExternalStoragePermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const readGranted = await PermissionsAndroid.request(
                    Platform.Version >= 30 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: '저장소 권한 필요',
                        message: '이 앱은 사진을 읽기 위해 저장소 접근 권한이 필요합니다.',
                        buttonNeutral: '나중에 묻기',
                        buttonNegative: '취소',
                        buttonPositive: '확인'
                    }
                );
                return readGranted === PermissionsAndroid.RESULTS.GRANTED;
            }
            return true;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const renderAnnouncementMessage = (message: string, backgroundColor: string = '#C6DBDA') => (
        <AnnouncementMessageBubble style={{ backgroundColor }}>
            <Text variant="sub" style={styles.messageText}>{message}</Text>
        </AnnouncementMessageBubble>
    );

    const renderUserMessage = () => (
            <MessageContainer isSelf={isSelf} showProfileTime={showProfileTime}>
                    {isSelf && (
                        <DateReadStatusContainer>
                            <ReadStatus isSelf={isSelf} variant="sub">{unreadCnt > 0 ? unreadCnt : ''}</ReadStatus>
                            {showProfileTime && <DateTime isSelf={isSelf} variant="sub">{datetime}</DateTime>}
                        </DateReadStatusContainer>
                    )}
                    <MessageContent isSelf={isSelf} isFile={type==='FILE'}>
                        {renderMessageContent()}
                    </MessageContent>

                    {!isSelf && (
                        <DateReadStatusContainer>
                            <ReadStatus isSelf={isSelf} variant="sub">{unreadCnt > 0 ? unreadCnt : ''}</ReadStatus>
                            {showProfileTime && <DateTime isSelf={isSelf} variant="sub">{datetime}</DateTime>}
                        </DateReadStatusContainer>
                    )}
            </MessageContainer>
    );

    const renderMessageBubble = () => {
        switch (type) {
            case 'FRIEND_REQUEST':
                return (
                    <AnnouncementMessageBubble>
                        <Text variant="sub" style={{ color: "#444444" }}>{message}</Text>
                        {!isSelf && message === '친구 요청을 보냈습니다.' && (
                            <FriendRequestActions
                                chatRoomId={chatRoomId}
                                senderId={senderId}
                                isDisabled={isDisabled}
                                setIsDisabled={setIsDisabled}
                            />
                        )}
                    </AnnouncementMessageBubble>
                );
            case 'TIMEOUT':
                return renderAnnouncementMessage(message, '#c0c0c0');
            case 'USER_JOIN':
                if (chatRoomType !== 'FRIEND') {
                    return renderAnnouncementMessage(`${message}님이 대화에 참여했습니다.`, 'transparent');
                }
                break;
            case 'USER_LEAVE':
                if (chatRoomType !== 'FRIEND') {
                    return renderAnnouncementMessage(`${message}님이 나갔습니다.`, 'transparent');
                }
                break;
            default:
                return renderUserMessage();
        }
    };

    const shouldShowProfile = senderId !== 0 && message && type !== 'FRIEND_REQUEST' && type !== 'TIMEOUT' && type !== 'USER_JOIN' && type !== 'USER_LEAVE';

    return (
        <Container isSelf={isSelf} notChat={type !== 'CHAT' && type !== 'FILE'}>
            {shouldShowProfile && !isSelf && showProfileTime && (
                <TouchableOpacity onPress={toggleUserInfoModal}>
                    <FastImage
                        source={profilePicture ? { uri: profilePicture } : require('../../../assets/images/anonymous.png')}
                        style={styles.profilePicture}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </TouchableOpacity>
            )}
            <BubbleContainer isSelf={isSelf} notChat={type !== 'CHAT' && type !== 'FILE'}>
                {shouldShowProfile && !isSelf && showProfileTime && username && (
                    <Username variant="subBold">{username}</Username>
                )}
                {renderMessageBubble()}
            </BubbleContainer>

            <UserProfileModal
                visible={modalVisible}
                onClose={toggleUserInfoModal}
                username={username}
                profilePicture={profilePicture}
                chatRoomType={chatRoomType}
            />

            <ImagePreviewModal
                visible={imageModalVisible}
                onClose={toggleImageModal}
                imageUrl={message.preSignedUrl}
                onDownload={handleFileDownload}
            />
        </Container>
    );
});

const Container = styled.View<{ isSelf: boolean; notChat: boolean }>`
    max-width: 80%;
    align-self: ${({ notChat, isSelf }) => (notChat ? 'center' : isSelf ? 'flex-end' : 'flex-start')};
    flex-direction: ${({ isSelf }) => (isSelf ? 'row-reverse' : 'row')};
    margin-top: ${({ notChat }) => (notChat ? '5px' : '5px')};
    margin-bottom: ${({ notChat }) => (notChat ? '5px' : '5px')};
`;


const styles = StyleSheet.create({
    profilePicture: {
        width: 32,
        height: 32,
        borderRadius: 20,
        marginRight: 5,
        marginLeft: 2,
        marginTop: 5,
    },
    profilePictureModal: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    messageText: {
        color: "#444444",
    },
    messageImage: {
        borderRadius: 10,
        width: 160,
        height: 120,
        resizeMode: "cover",
    },
});

const MessageContentContainer = styled.View<{ isSelf: boolean }>`
    flex-direction: ${({ isSelf }) => (isSelf ? 'row-reverse' : 'row')};
    align-items: flex-end;
`;

const AnnouncementMessageBubble = styled.View`
    padding: 10px 15px;
    border-radius: 20px;
    background-color: #C6DBDA;
`;

const BubbleContainer = styled.View<{ isSelf: boolean; notChat: boolean }>`
    flex: 1;
    align-items: ${({ isSelf, notChat }) => (notChat ? 'center' : isSelf ? 'flex-end' : 'flex-start')};
`;

const MessageContainer = styled.View<{ isSelf: boolean; showProfileTime: boolean }>`
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: nowrap;
    max-width: 78%;
    justify-content: ${({ isSelf }) => (isSelf ? 'flex-end' : 'flex-start')};
    margin-left: ${({ isSelf, showProfileTime }) => (!isSelf && !showProfileTime ? '39px' : '0px')};
`;

const MessageContent = styled.View<{ isSelf: boolean, isFile: boolean}>`
    padding: ${({ isFile}) => (isFile? '0px':'5px 10px')};
    border-radius: 10px;
    background-color: ${({ isSelf}) => (isSelf ? '#E4F1EE' : '#FFFFFF')};
    flex-shrink: 1;
    max-width: 100%;
`;

const Username = styled(Text)`
    margin-bottom: 5px;
    margin-top: 2px;
`;

const DateTime = styled(Text)<{ isSelf: boolean }>`
    font-size: 9px;
    color: #888888;
    margin-right: ${({ isSelf }) => (isSelf ? '6px' : '0')};
    align-self: flex-end;
    flex-shrink: 0;
    padding-left: 8px;
`;

const ReadStatus = styled(Text)<{ isSelf: boolean }>`
    font-size: 10px;
    color: #20b2aa;
    margin-bottom: 1px;
    margin-right: ${({ isSelf }) => (isSelf ? '8px' : '0')};
    align-self: ${({ isSelf }) => (isSelf ? 'flex-end' : 'flex-start')};
    flex-shrink: 0;
    padding-left: 8px;
`;

const DateReadStatusContainer = styled.View`
    flex-direction: column;
    justify-content: space-between;
`;

export default MessageBubble;

import React, { useState, useRef } from 'react';
import { View, Image, Modal, TouchableOpacity, Button, Alert, Linking, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import ImageTextButton from "../common/Button";
import WebSocketManager from "../../utils/WebSocketManager";
import {acceptFriendRequest, rejectFriendRequest, sendFriendRequest} from "../../service/Friends/FriendRelationService";
import Text from '../common/Text';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import { NativeModules } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import ImageResizer from 'react-native-image-resizer';
import Exif from 'react-native-exif'
import ImagePicker from 'react-native-image-crop-picker';
import FastImage, { Source } from 'react-native-fast-image';

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
    onFileDownload?: () => void; // Optional download handler for file messages
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
                                                         message, datetime, isSelf, type, unreadCnt,
                                                         senderId, chatRoomId, chatRoomType,
                                                         profilePicture, username, showProfileTime, onFileDownload
                                                     }) => {
    // const date = new Date(datetime);
    // const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedTime = datetime;
    const [isDisabled, setIsDisabled] = useState(chatRoomType === 'FRIEND');
    const [modalVisible, setModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const resizedImageUri = useRef(message.preSignedUrl)

    // const resizeImage = async (uri) => {
    //     try {
    //         console.log("resizeImage")

    //         const response = await ImageResizer.createResizedImage(
    //             uri, //이미지 파일의 경로 또는 base64 인코딩된 이미지 문자열
    //             500,
    //             500,
    //             'JPEG', //JPEG, PNG or WEBP
    //             100, //0~100 화질 설정
    //             90, // iOS에서 회전은 90도의 배수로 제한
    //             null,
    //             true,
    //             { onlyScaleDown: true },
    //           ); // Returns a Promise
    //         resizedImageUri.current = response.uri;
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };

    const handleAccept = async () => {
        const response = await acceptFriendRequest(senderId, chatRoomId);
        console.log('수락 요청 응답: ',response);
        if (response === true) {
            WebSocketManager.sendMessage(String(chatRoomId), "친구가 되었습니다!\n대화를 이어가보세요.", 'FRIEND_REQUEST');
            setIsDisabled(true);
        }
    };

    const handleReject = async () => {
        const response = await rejectFriendRequest(senderId);
        console.log('거절 요청 응답: ',response);
        if (response === true) {
            WebSocketManager.sendMessage(String(chatRoomId), "인연이 스쳐갔습니다.", 'FRIEND_REQUEST');
            setIsDisabled(true);
        }
    };

    const handleSend = async () =>{
        const response = await sendFriendRequest(senderId);
        console.log('친구요청 응답 출력', response);
        if (response === true) {
            WebSocketManager.sendMessage(chatRoomId, "친구 요청을 보냈습니다.", 'FRIEND_REQUEST');
            // 친구추가 버튼 없애기 버튼 or 요청중 상태 나타내는 것 추가
        }
    };

    const openUserInfoModal = () => {
        setModalVisible(true);
    };

    const closeUserInfoModal = () => {
        setModalVisible(false);
    };

    const openImageModal = async () => {
        // await resizeImage(message.preSignedUrl)
        setImageModalVisible(true);
    }

    const closeImageModal = () => {
        setImageModalVisible(false);
    }

    // 10이하 버전의 권한
    async function requestLegacyExternalStoragePermission() {
        try {
            if (Platform.OS === 'android') {
                const readGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'This app needs access to your storage to read photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (readGranted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Storage permissions granted');
                    return true;
                } else {
                    console.log('Storage permissions denied');
                    return false;
                }
            } else {
                return true; // iOS에서 권한 요청은 별도로 처리
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }


    // Android 11 이상 버전의 권한 요청
    async function requestExternalStoragePermission() {
        try {
            if (Platform.OS === 'android') {
                if (Number(Platform.Version) >= 30) { // Android 11(R) 이상
                    console.log(Number(Platform.Version));
                    const readGranted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        {
                            title: 'Storage Permission Required',
                            message: 'This app needs access to your storage to read photos.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );
                    const manageGranted = (readGranted === PermissionsAndroid.RESULTS.GRANTED);
                    if (!manageGranted) {
                        Alert.alert(
                            'Storage Permission Required',
                            'This app needs access to manage all files on your device. Please grant this permission in the settings.',
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                },
                                {
                                    text: 'OK',
                                    onPress: () => Linking.openSettings(),
                                },
                            ],
                        );
                        return false;
                    }
                    return true;
                } else { // Android 10(Q) 이하
                    return await requestLegacyExternalStoragePermission();
                }
            } else {
            return true; // iOS에서 권한 요청은 별도로 처리
        }
    } catch (err) {
        console.warn(err);
        return false;
    }
}



    const handleFileDownload = async () => {
        try {
                // 권한 요청
                const hasPermission = await requestExternalStoragePermission();
                if (!hasPermission) {
                    Alert.alert('권한 오류', '외부 저장소 접근 권한이 필요합니다.', [{ text: '확인' }]);
                    return;
                }

                const { preSignedUrl } = message;

                const path = `${RNFS.ExternalStorageDirectoryPath}/DCIM/Camera`; // 저장소

                //  const version = Number(Platform.Version);
                //  const path = version >= 30
                //      ? `${RNFS.ExternalStorageDirectoryPath}/Pictures/Chalna`
                //      : `${RNFS.ExternalStorageDirectoryPath}/DCIM/Camera`; // 저장소 경로 설정

                let downloadDest = `${path}/chalna_${message.fileId}_${Date.now()}_sd.jpg`; // 다운로드 경로

                // 디렉토리가 존재하는지 확인하고, 없다면 생성
                const directoryExists = await RNFS.exists(path);
                console.log("exists", directoryExists)
                if (!directoryExists) {
                    try {
                        await RNFS.mkdir(path, { NSURLIsExcludedFromBackupKey: true });
                        console.log("디렉토리 생성 완료", path)
                    } catch (error) {
                        console.error('디렉토리 생성 오류: ', error);
                        Alert.alert('디렉토리 생성 오류', '디렉토리 생성에 실패했습니다.', [{ text: '확인' }]);
                        return;
                    }
                }

                const downloadOptions = {
                    fromUrl: preSignedUrl, // s3 다운 경로
                    toFile: downloadDest, // 로컬 다운 경로
                };
                console.log('s3 다운로드 경로 :',preSignedUrl);

                const res = RNFS.downloadFile(downloadOptions);
                console.log('Download result:', res);

                const result = await res.promise;
                console.log('result : ',result);
                console.log('Download status code:', result.statusCode);

                if (result.statusCode === 200) {
                    try {
                        await RNFS.scanFile(downloadDest);
                        console.log('파일 스캔 완료');
                        Alert.alert('다운로드 완료', '사진이 갤러리에 저장되었습니다.', [{ text: '확인' }]);
                    } catch (moveError) {
                        console.error('파일 이동/스캔 오류:', moveError);
                        Alert.alert('파일 이동 오류', '사진 이동에 실패했습니다.', [{ text: '확인' }]);
                    }

                } else if (result.statusCode === 403) {
                    Alert.alert('다운로드 실패', '사진이 만료되었습니다.', [{ text: '확인' }]);

                }
                else {
                    Alert.alert('다운로드 실패', '사진 다운로드에 실패했습니다.', [{ text: '확인' }]);
                }

        } catch (error) {
            console.error('File download error:', error);
            Alert.alert('다운로드 실패', '사진 다운로드 중 오류가 발생했습니다.', [{ text: '확인' }]);
        }
    };

    const renderMessageContent = () => {
        if (typeof message === 'string' && message) {
            const hasNewline = message.includes('\n');
            return(
                <MessageBubbleContent isSelf={isSelf} hasNewline={hasNewline}>
                    <Text variant="sub" style={{ color: "#444444" }}>{message}</Text>
                </MessageBubbleContent>
            );
        } else if (type === 'FILE' && message.preSignedUrl) {
            console.log(message.preSignedUrl);
            return (
                <ImageContainer isSelf={isSelf} >
                    <TouchableOpacity onPress={openImageModal}>

                    <Image
                        source={{ uri: message.preSignedUrl }}
                        style={{ width: '100%', height: 150, resizeMode: "cover", borderRadius: 10 }}
                    />
                    </TouchableOpacity>
                </ImageContainer>
            );


        } else if (typeof message === 'object') {
            return(
            // Handle other object types if necessary
                <MessageBubbleContent isSelf={isSelf}>
                    <Text variant="sub" style={{ color: "#444444" }}>{JSON.stringify(message)}</Text>;
                </MessageBubbleContent>
            )
        } else {
            return null;
        }
    };


    const notChat = (type!=='CHAT' && type!=='FILE');

    return (
        <Container isSelf={isSelf} notChat={notChat}>
            {!isSelf && showProfileTime && (!notChat) && (
                <TouchableOpacity onPress={openUserInfoModal}>
                    { profilePicture ?
                    (<FastImage
                    style={styles.profilePicture}
                    source={{uri: profilePicture, priority: FastImage.priority.normal } as Source}
                    resizeMode={FastImage.resizeMode.cover}
                    />) : (
                    <Image
                    source={ require('../../assets/images/anonymous.png')}
                    style={styles.profilePicture }
                    />
                    )}
                    {/* <ProfilePicture source={{ uri: profilePicture || 'https://www.refugee-action.org.uk/wp-content/uploads/2016/10/anonymous-user.png' }} /> */}
                </TouchableOpacity>
            )}
            <BubbleContainer isSelf={isSelf} notChat={notChat}>
                {!isSelf && showProfileTime && username && (!notChat) && <Username variant="subBold">{username}</Username>}
                {type === 'FRIEND_REQUEST' ? (
                    <AnnouncementMessageBubble>
                        <Text variant="sub" style={{color:"#444444"}}>{message}</Text>
                        {!isSelf && message === '친구 요청을 보냈습니다.' && (
                            <ButtonContainer>
                                <ImageTextButton title='수락' onPress={handleAccept} disabled={isDisabled} />
                                <ImageTextButton title='거절' onPress={handleReject} disabled={isDisabled} />
                            </ButtonContainer>
                        )}
                    </AnnouncementMessageBubble>
                ) : type==='TIMEOUT'? (
                    <AnnouncementMessageBubble style={{backgroundColor: '#c0c0c0'}} isUser={false}>
                        <Text variant="sub" style={{color:"#444444"}}>{message}</Text>
                    </AnnouncementMessageBubble>
                ) : type==='USER_JOIN'? (
                    <AnnouncementMessageBubble style={{backgroundColor: 'transparent'}} isUser={true}>
                        <Text variant="sub" style={{color:"#444444"}}>{message+'님이 대화에 참여했습니다.'}</Text>
                    </AnnouncementMessageBubble>
                ) : type==='USER_LEAVE'? (
                    <AnnouncementMessageBubble style={{backgroundColor: 'transparent'}} isUser={true}>
                        <Text variant="sub" style={{color:"#444444"}}>{message+'님이 나갔습니다.'}</Text>
                    </AnnouncementMessageBubble>
                ) : (

                    <MessageContainer isSelf={isSelf} showProfileTime={showProfileTime}>
                        {isSelf && (<DateReadStatusContainer>
                                <ReadStatus isSelf={isSelf} variant="sub">{unreadCnt>0? unreadCnt:''}</ReadStatus>
                                {showProfileTime && <DateTime isSelf={isSelf} variant="sub">{formattedTime}</DateTime>}
                        </DateReadStatusContainer>)}

                        {type==='FILE' ? (
                            renderMessageContent()
                        ): (
                            <MessageBubbleContent isSelf={isSelf} >
                                {renderMessageContent()}
                            </MessageBubbleContent>
                        )}

                        {!isSelf && (<DateReadStatusContainer>
                            <ReadStatus isSelf={isSelf} variant="sub">{unreadCnt>0? unreadCnt:''}</ReadStatus>
                            {showProfileTime && <DateTime isSelf={isSelf} variant="sub">{formattedTime}</DateTime>}
                        </DateReadStatusContainer>)}
                    </MessageContainer>
                )
            }
            </BubbleContainer>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeUserInfoModal}
            >
                <ModalContainer>
                    <ModalContent>
                        <ImageTextButton iconSource={require('../../assets/Icons/closeIcon.png')}
                                         imageStyle={{height: 15, width: 15}}
                                         onPress={closeUserInfoModal} style={{alignSelf:'flex-end'}}/>
                        { profilePicture ?
                        (<FastImage
                        style={styles.profilePictureModal}
                        source={{uri: profilePicture, priority: FastImage.priority.normal } as Source}
                        resizeMode={FastImage.resizeMode.cover}
                        />) : (
                        <Image
                        source={ require('../../assets/images/anonymous.png')}
                        style={styles.profilePictureModal }
                        />
                        )}
                        <NameBtnContainer>
                            <Text variant="subtitle" >{username}</Text>
                            { chatRoomType==='FRIEND'? (
                                <Image
                                    source={require('../../assets/Icons/friendIcon.png')}
                                    style={{height: 18, width: 24, marginLeft:6, marginTop:7}}
                                    resizeMode={"stretch"}
                                />
                                ):(
                            <ImageTextButton
                                style={{marginTop: 1, marginLeft:5}}
                                iconSource={require('../../assets/Icons/AddFriendCircle.png')}
                                imageStyle={{height:25, width: 25}}
                                onPress={handleSend}
                            />
                                )}
                        </NameBtnContainer>
                        <Text variant={"sub"} style={{size: 12, marginBottom: 10}} >{"스쳐간 횟수 or 상태메세지 표기"}</Text>

                    </ModalContent>
                </ModalContainer>
            </Modal>


            <Modal
                animationType="slide"
                transparent={true}
                visible={imageModalVisible}
                onRequestClose={closeImageModal}
            >
                <FullScreenModalContainer>
                    <FullScreenModalContent>

                        <ImageTextButton iconSource={require('../../assets/Icons/closeIcon.png')}
                                         imageStyle={{height: 15, width: 15, marginRight:10, marginTop: 10 }}
                                         onPress={closeImageModal} style={{ alignSelf: 'flex-end' }} />
                        <Image
                            // source={{ uri: resizedImageUri.current }}
                            source={{uri: message.preSignedUrl}}
                            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                        />
                        <ImageTextButton iconSource={require('../../assets/Icons/downloadIcon.png')}
                                         imageStyle={{height: 20, width: 20}}
                                         onPress={handleFileDownload} />

                    </FullScreenModalContent>
                </FullScreenModalContainer>
            </Modal>
        </Container>
    );
});

const Container = styled.View<{ isSelf: boolean , notChat: boolean}>`
    max-width: 80%;
    align-self: ${({ notChat, isSelf }) => (notChat? 'center': isSelf ? 'flex-end' : 'flex-start')};
    flex-direction: ${({ isSelf }) => (isSelf ? 'row-reverse' : 'row')};
    margin-top: ${({notChat})=>(notChat? '15px': '5px')};
    margin-bottom: ${({notChat})=>(notChat? '15px': '5px')};
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
      marginRight: 0,
      marginLeft: 0,
      marginTop: 0,
    },
  });

const ProfilePicture = styled.Image<{ modal?: boolean }>`
    width: ${({ modal }) => (modal ? '100px' : '32px')};
    height: ${({ modal }) => (modal ? '100px' : '32px')};
    border-radius: ${({ modal }) => (modal ? '50px' : '20px')};
    margin-right: ${({ modal }) => (modal ? '0' : '5px')};
    margin-left: ${({ modal }) => (modal ? '0' : '2px')};
    margin-top: ${({ modal }) => (modal ? '0' : '5px')};
`;

const BubbleContainer = styled.View<{ isSelf: boolean , notChat: boolean}>`
    flex: 1;
    align-items: ${({ isSelf, notChat }) => (notChat? 'center': isSelf ? 'flex-end' : 'flex-start')};
`;

const MessageContainer = styled.View<{ isSelf: boolean; hasNewline: boolean;   showProfileTime: boolean }>`
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: wrap;
    max-width: ${({ hasNewline, isSelf }) => (isSelf && hasNewline ? '82%' : !isSelf && hasNewline? '78%' : 'auto')};
    justify-content: ${({ isSelf }) => (isSelf ? 'flex-end' : 'flex-start')};
    margin-left: ${({ isSelf, showProfileTime }) => (!isSelf && !showProfileTime ? '39px' : '0px')}; 
`; //bottom margin-left : profile pic length


const MessageBubbleContent = styled.View<{ isSelf: boolean; hasNewline: boolean}>`
    padding: 3px 5px;
    border-radius: 10px;
    background-color: ${({ isSelf }) => (isSelf ? '#E4F1EE' : '#FFFFFF')};
    flex-shrink: 1;
    max-width: ${({hasNewline})=>(hasNewline? 'auto': '100%')};
`;
// max-width: 78%;

const ImageContainer = styled.View<{ isSelf: boolean;}>`
    border-radius: 10px;
    flex: 1;
    //flex-shrink: 1;
    max-width: 78%;
    align-self: ${({ isSelf}) => (isSelf? 'flex-end' : 'flex-start')};
    
`;

const AnnouncementMessageBubble = styled.View<{isUser: boolean;}>`
    padding: ${({ isUser}) => (isUser? '0px 0px 0px 0px' : '10px 15px 10px 15px')};
    border-radius: 20px;
    background-color: #C6DBDA;
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

// #377e22;
// #20b2aa;
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

const ButtonContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
`;

const ModalContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
`;

const NameBtnContainer =styled.View`
    margin-top: 10px;
    margin-bottom: 5px;
    flex-direction: row;
    
`;

const ModalContent = styled.View`
    width: 80%;
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    align-items: center;
`;

const CloseModalButton = styled(Text)`
    font-size: 16px;
    color: #5A5A5A;
`;

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

const FullScreenImage = styled.Image`
    width: 100%;
    height: 80%;
    resize-mode: contain;
`;

export default MessageBubble;

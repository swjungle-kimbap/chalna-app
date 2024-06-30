import React, { useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import ImageTextButton from "../common/Button";
import WebSocketManager from "../../utils/WebSocketManager";
import { acceptFriendRequest, rejectFriendRequest } from "../../service/FriendRelationService";

interface MessageBubbleProps {
    message: string;
    datetime: string;
    isSelf: boolean;
    type?: string;
    status?: boolean;
    otherId: number;
    chatRoomId: string;
    chatRoomType: string;
    profilePicture?: string;
    username?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, datetime, isSelf, type, status, otherId, chatRoomId, chatRoomType, profilePicture, username }) => {
    const date = new Date(datetime);
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const [isDisabled, setIsDisabled] = useState(chatRoomType === 'FRIEND');
    const [modalVisible, setModalVisible] = useState(false);

    const handleAccept = async (chatRoomId: string) => {
        const response = await acceptFriendRequest(chatRoomId);
        if (response) {
            WebSocketManager.sendMessage(chatRoomId, "친구가 되었습니다!\n대화를 이어가보세요.", 'FRIEND_REQUEST');
        }
        setIsDisabled(response);
    };

    const handleReject = async (otherId: number) => {
        const response = await rejectFriendRequest(otherId);
        if (response) {
            WebSocketManager.sendMessage(chatRoomId, "인연이 스쳐갔습니다.", 'FRIEND_REQUEST');
        }
        setIsDisabled(response);
    };

    const openUserInfoModal = () => {
        setModalVisible(true);
    };

    const closeUserInfoModal = () => {
        setModalVisible(false);
    };

    const hasNewline = message.includes('\n');

    return (
        <Container isSelf={isSelf}>
            {!isSelf && (
                <TouchableOpacity onPress={openUserInfoModal}>
                    <ProfilePicture source={{ uri: profilePicture || 'https://www.refugee-action.org.uk/wp-content/uploads/2016/10/anonymous-user.png' }} />
                </TouchableOpacity>
            )}
            <BubbleContainer isSelf={isSelf}>
                {!isSelf && username && <Username>{username}</Username>}
                {type === 'FRIEND_REQUEST' ? (
                    <AnnouncementMessageBubble>
                        <Text>{message}</Text>
                        {!isSelf && message === '친구 요청을 보냈습니다.' && (
                            <ButtonContainer>
                                <ImageTextButton title='수락' onPress={() => handleAccept(chatRoomId)} disabled={isDisabled} />
                                <ImageTextButton title='거절' onPress={() => handleReject(otherId)} disabled={isDisabled} />
                            </ButtonContainer>
                        )}
                    </AnnouncementMessageBubble>
                ) : (
                    <MessageContainer isSelf={isSelf} hasNewline={hasNewline}>
                        {isSelf && <DateTime isSelf={isSelf}>{formattedTime}</DateTime>}
                        <MessageBubbleContent isSelf={isSelf} hasNewline={hasNewline}>
                            <Text>{message}</Text>
                        </MessageBubbleContent>
                        {!isSelf && <DateTime isSelf={isSelf}>{formattedTime}</DateTime>}
                    </MessageContainer>
                )}
            </BubbleContainer>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeUserInfoModal}
            >
                <ModalContainer>
                    <ModalContent>
                        <ModalUsername>{username}</ModalUsername>
                        <ProfilePicture source={{ uri: profilePicture || 'https://www.refugee-action.org.uk/wp-content/uploads/2016/10/anonymous-user.png' }} modal />
                        <TouchableOpacity onPress={closeUserInfoModal}>
                            <CloseModalButton>Close</CloseModalButton>
                        </TouchableOpacity>
                    </ModalContent>
                </ModalContainer>
            </Modal>
        </Container>
    );
};

const Container = styled.View<{ isSelf: boolean }>`
    max-width: 80%;
    margin-vertical: 5px;
    align-self: ${({ isSelf }) => (isSelf ? 'flex-end' : 'flex-start')};
    flex-direction: ${({ isSelf }) => (isSelf ? 'row-reverse' : 'row')};
    align-items: flex-start;
`;

const ProfilePicture = styled.Image<{ modal?: boolean }>`
    width: ${({ modal }) => (modal ? '100px' : '40px')};
    height: ${({ modal }) => (modal ? '100px' : '40px')};
    border-radius: ${({ modal }) => (modal ? '50px' : '20px')};
    margin-right: ${({ modal }) => (modal ? '0' : '10px')};
    margin-left: ${({ modal }) => (modal ? '0' : '2px')};
`;

const BubbleContainer = styled.View<{ isSelf: boolean }>`
    flex: 1;
    align-items: ${({ isSelf }) => (isSelf ? 'flex-end' : 'flex-start')};
`;

const MessageContainer = styled.View<{ isSelf: boolean, hasNewline: boolean }>`
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: wrap;
    max-width: ${({ hasNewline }) => (hasNewline ? '80%' : 'auto')};
    justify-content: ${({ isSelf }) => (isSelf ? 'flex-end' : 'flex-start')};
`;

const MessageBubbleContent = styled.View<{ isSelf: boolean, hasNewline: boolean }>`
    padding: 8px 15px;
    border-radius: 10px;
    background-color: ${({ isSelf }) => (isSelf ? '#E4F1EE' : '#FFFFFF')};
    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.25;
    shadow-radius: 5px;
    flex-shrink: 1;
    max-width: ${({ hasNewline }) => (hasNewline ? '100%' : 'auto')};
`;

const AnnouncementMessageBubble = styled.View`
    padding: 10px 15px;
    border-radius: 20px;
    background-color: #FFD700;
    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.25;
    shadow-radius: 5px;
`;

const Username = styled.Text`
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 12px;
    margin-left: 0px;
`;

const DateTime = styled.Text<{ isSelf: boolean }>`
    font-size: 12px;
    color: #888888;
    margin-top: 5px;
    //margin-left: ${({ isSelf }) => (isSelf ? '8px' : '0')};
    margin-right: ${({ isSelf }) => (isSelf ? '8px' : '0')};
    align-self: flex-end;
    flex-shrink: 0;
    padding-left: 8px;
`;

const ButtonContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
    margin-horizontal: 10px;
`;

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

const ModalUsername = styled.Text`
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
`;

const CloseModalButton = styled.Text`
    font-size: 16px;
    color: #007BFF;
`;

export default MessageBubble;





// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Button, Alert } from 'react-native';
// import ImageTextButton from "../common/Button";
// import WebSocketManager from "../../utils/WebSocketManager";
// import {acceptFriendRequest, rejectFriendRequest} from "../../service/FriendRelationService";
//
// interface MessageBubbleProps {
//     message: string;
//     datetime: string;
//     isSelf: boolean;
//     type?: string;
//     status?: boolean;
//     otherId: number;
//     chatRoomId:string;
//     chatRoomType:string;
//     profilePicture?: string;
//     username?: string;
// }
//
// const MessageBubble: React.FC<MessageBubbleProps> = ({ message, datetime, isSelf, type, status, otherId,chatRoomId, chatRoomType  }) => {
//     const date = new Date(datetime);
//     const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     const [isDisabled, setIsDisabled] = useState(chatRoomType==='FRIEND');
//     const [modalVisible, setModalVisible] = useState(false);
//
//     const handleAccept = async ({chatRoomId: string}) => {
//         const response = await acceptFriendRequest(chatRoomId); // 성공시 true, 실패시 false 반환
//         if(response) // 성공시 채팅방에 친구 성공 메세지 전송
//             WebSocketManager.sendMessage(chatRoomId, "친구가 되었습니다!\n"+"대화를 이어가보세요.",'FRIEND_REQUEST');
//         setIsDisabled(response); // 수락/거절 버튼 비활성화
//     }
//
//     const handleReject = async ({ otherId: number }) => {
//         const response = await rejectFriendRequest(otherId); // 성공시 true, 실패시 false 반환
//         if(response) // 성공시 채팅방에 거절 메세지 전송
//             WebSocketManager.sendMessage(chatRoomId, "인연이 스쳐갔습니다.",'FRIEND_REQUEST');
//         setIsDisabled(response); // 수락/거절 버튼 비활성화
//     }
//
//     const openUserInfoModal = () => {
//         setModalVisible(true);
//     }
//
//     const closeUserInfoModal = () => {
//         setModalVisible(false);
//     }
//
//     return (
//         <View style={[styles.container,
//             isSelf ? styles.selfContainer : styles.otherContainer,
//             (type === 'FRIEND_REQUEST' && message!=='친구 요청을 보냈습니다.') && styles.centerContainer]}>
//             <View style={[styles.messageContent,
//                 isSelf ? styles.myMessageBubbleColor : styles.friendMessageBubbleColor,
//                 (type === 'FRIEND_REQUEST' && message!=='친구 요청을 보냈습니다.') && styles.centerMsg
//             ]}>
//                 <Text style={styles.messageText}>{message}</Text>
//                 {type === 'FRIEND_REQUEST' && !isSelf && message === '친구 요청을 보냈습니다.' && (
//                     <View style={styles.buttonContainer}>
//                         <ImageTextButton title='수락' onPress={() => handleAccept(chatRoomId)} disabled={isDisabled} />
//                         <ImageTextButton title='거절' onPress={handleReject(otherId)} disabled={isDisabled} />
//                     </View>
//                 )}
//             </View>
//             {isSelf ? (
//                 <View style={styles.tailRight} />
//             ) : (
//                 <View style={styles.tailLeft} />
//             )}
//             <Text style={[styles.datetime,
//                 (type === 'FRIEND_REQUEST' && message !== '친구 요청을 보냈습니다.')?
//                     styles.timeMiddle : styles.timeRight]}>{formattedTime}</Text>
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         maxWidth: '80%',
//         marginVertical: 5,
//         alignSelf: 'flex-start',
//     },
//     selfContainer: {
//         alignSelf: 'flex-end',
//     },
//     otherContainer: {
//         alignSelf: 'flex-start',
//     },
//     messageContent: {
//         paddingVertical: 10,
//         paddingHorizontal:15,
//         borderRadius: 20,
//         shadowColor: '#000',        // Color of the shadow
//         shadowOffset: { width: 0, height: 4 },  // Direction and distance of the shadow
//         shadowOpacity: 0.25,        // Opacity of the shadow
//         shadowRadius: 5,
//     },
//     friendMessageBubbleColor: {
//         backgroundColor: '#FFFFFF',
//     },
//     myMessageBubbleColor:{
//         // backgroundColor: '#DFEBEB',
//         // backgroundColor: '#D5E3E8',
//         backgroundColor: '#E4F1EE',
//     },
//     messageText: {
//         fontSize: 16,
//         color: '#333',
//     },
//     datetime: {
//         fontSize: 12,
//         color: '#888888',
//     },
//     timeRight: {
//         marginTop:5,
//         alignSelf: 'flex-end',
//         marginRight: 10,
//     },
//     timeMiddle: {
//         alignSelf: 'center',
//         marginTop: -10,
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 10,
//         marginHorizontal:10,
//     },
//     centerContainer:{
//         alignSelf: 'center',
//         alignItems:'center',
//         backgroundColor:'transparent',
//         borderWidth: 0,
//     },
//     centerMsg:{
//         backgroundColor: 'transparent'
//     },
//     tailRight: {
//         position: 'absolute',
//         right: -6,
//         top: '50%',
//         borderTopWidth: 10,
//         borderBottomWidth: 10,
//         borderLeftWidth: 6,
//         borderTopColor: 'transparent',
//         borderBottomColor: 'transparent',
//         borderLeftColor: '#DCF8C6',
//         marginTop: -10,
//     },
//     tailLeft: {
//         position: 'absolute',
//         left: -6,
//         top: '50%',
//         borderTopWidth: 10,
//         borderBottomWidth: 10,
//         borderRightWidth: 6,
//         borderTopColor: 'transparent',
//         borderBottomColor: 'transparent',
//         borderRightColor: '#FFFFFF',
//         marginTop: -10,
//     },
// });
//
// export default MessageBubble;

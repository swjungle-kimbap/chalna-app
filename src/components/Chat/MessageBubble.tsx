import React, { useState } from 'react';
import { View, Image, Modal, TouchableOpacity, Button } from 'react-native';
import styled from 'styled-components/native';
import ImageTextButton from "../common/Button";
import WebSocketManager from "../../utils/WebSocketManager";
import {acceptFriendRequest, rejectFriendRequest, sendFriendRequest} from "../../service/FriendRelationService";
import Text from '../common/Text';

interface MessageBubbleProps {
    message: string;
    datetime: string;
    isSelf: boolean;
    type?: string;
    unreadCnt?: number;
    otherId: number;
    chatRoomId: number;
    chatRoomType: string;
    profilePicture?: string;
    username?: string;
    showProfileTime?: boolean;
    onFileDownload?: () => void; // Optional download handler for file messages
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
                                                         message, datetime, isSelf, type, unreadCnt,
                                                         otherId, chatRoomId, chatRoomType,
                                                         profilePicture, username, showProfileTime, onFileDownload
                                                     }) => {
    // const date = new Date(datetime);
    // const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedTime = datetime;
    const [isDisabled, setIsDisabled] = useState(chatRoomType === 'FRIEND');
    const [modalVisible, setModalVisible] = useState(false);

    const handleAccept = async () => {
        const response = await acceptFriendRequest(chatRoomId);
        console.log('수락 요청 응답: ',response);
        if (response === true) {
            WebSocketManager.sendMessage(String(chatRoomId), "친구가 되었습니다!\n대화를 이어가보세요.", 'FRIEND_REQUEST');
            setIsDisabled(true);
        }
    };

    const handleReject = async () => {
        const response = await rejectFriendRequest(otherId);
        console.log('거절 요청 응답: ',response);
        if (response === true) {
            WebSocketManager.sendMessage(String(chatRoomId), "인연이 스쳐갔습니다.", 'FRIEND_REQUEST');
            setIsDisabled(true);
        }
    };

    const handleSend = async () =>{
        const response = await sendFriendRequest(chatRoomId, otherId);
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

    const renderMessageContent = () => {
        if (typeof message === 'string') {
            return <Text variant="sub" style={{ color: "#444444" }}>{message}</Text>;
        } else if (type === 'FILE' && message.preSignedUrl) {
            console.log(message.preSignedUrl);
            return (
                <Image
                    source={{ uri: message.preSignedUrl }}
                    style={{ width: 200, height: 200, borderRadius: 10 }}
                />
            );
        } else if (typeof message === 'object') {
            // Handle other object types if necessary
            return <Text variant="sub" style={{ color: "#444444" }}>{JSON.stringify(message)}</Text>;
        } else {
            return null;
        }
    };

    // const hasNewline = message.includes('\n');

    return (
        <Container isSelf={isSelf} notChat={type!=='CHAT' && type!=='FILE'}>
            {!isSelf && showProfileTime && type==='CHAT' && (
                <TouchableOpacity onPress={openUserInfoModal}>
                    <ProfilePicture source={{ uri: profilePicture || 'https://www.refugee-action.org.uk/wp-content/uploads/2016/10/anonymous-user.png' }} />
                </TouchableOpacity>
            )}
            <BubbleContainer isSelf={isSelf} notChat={type!=='CHAT'}>
                {!isSelf && showProfileTime && username && type==='CHAT' && <Username variant="subBold">{username}</Username>}
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
                    <AnnouncementMessageBubble style={{backgroundColor: '#c0c0c0'}}>
                        <Text variant="sub" style={{color:"#444444"}}>{message}</Text>
                    </AnnouncementMessageBubble>
                ) : type==='CHAT'? (
                    <MessageContainer isSelf={isSelf} showProfileTime={showProfileTime}>
                        {isSelf && (<DateReadStatusContainer>
                                <ReadStatus isSelf={isSelf} variant="sub">{unreadCnt}</ReadStatus>
                                {showProfileTime && <DateTime isSelf={isSelf} variant="sub">{formattedTime}</DateTime>}
                        </DateReadStatusContainer>)}
                        <MessageBubbleContent>
                            {renderMessageContent()}
                            {/*isSelf={isSelf} hasNewline={hasNewline}>*/}
                            {/*<Text variant="sub" style={{color:"#444444"}}>{message}</Text>*/}
                        </MessageBubbleContent>
                        {!isSelf && (<DateReadStatusContainer>
                            <ReadStatus isSelf={isSelf} variant="sub">{unreadCnt}</ReadStatus>
                            {showProfileTime && <DateTime isSelf={isSelf} variant="sub">{formattedTime}</DateTime>}
                        </DateReadStatusContainer>)}
                    </MessageContainer>
                ) : (
                    <MessageContainer>
                        message
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
                        <ImageTextButton title={"닫기"} onPress={closeUserInfoModal} style={{alignSelf:'flex-end'}}/>
                        <ProfilePicture modal source={{uri:
                                    profilePicture ||
                                    'https://www.refugee-action.org.uk/wp-content/uploads/2016/10/anonymous-user.png' }}
                        />
                        <NameBtnContainer>
                            <Text variant="subtitle" >{username}</Text>
                            <ImageTextButton
                                style={{marginTop: 1, marginLeft:5}}
                                iconSource={require('../../assets/Icons/AddFriendCircle.png')}
                                imageStyle={{height:25, width: 25}}
                                onPress={handleSend}
                            />
                        </NameBtnContainer>
                        <Text variant={"sub"} style={{size: 12, marginBottom: 10}} >{"스쳐간 횟수 or 상태메세지 표기"}</Text>

                    </ModalContent>
                </ModalContainer>
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

const ProfilePicture = styled.Image<{ modal?: boolean }>`
    width: ${({ modal }) => (modal ? '100px' : '34px')};
    height: ${({ modal }) => (modal ? '100px' : '34px')};
    border-radius: ${({ modal }) => (modal ? '50px' : '20px')};
    margin-right: ${({ modal }) => (modal ? '0' : '10px')};
    margin-left: ${({ modal }) => (modal ? '0' : '2px')};
    margin-top: ${({ modal }) => (modal ? '0' : '5px')};
`;

const BubbleContainer = styled.View<{ isSelf: boolean , notChat: boolean}>`
    flex: 1;
    align-items: ${({ isSelf, notChat }) => (notChat? 'center': isSelf ? 'flex-end' : 'flex-start')};
`;

const MessageContainer = styled.View<{ isSelf: boolean; hasNewline: boolean; showProfileTime: boolean }>`
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: wrap;
    max-width: ${({ hasNewline, isSelf }) => (isSelf && hasNewline ? '82%' : !isSelf && hasNewline? '78%' : 'auto')};
    justify-content: ${({ isSelf }) => (isSelf ? 'flex-end' : 'flex-start')};
    margin-left: ${({ isSelf, showProfileTime }) => (!isSelf && !showProfileTime ? '46px' : '0px')}; 
`; //bottom margin-left : profile pic length


const MessageBubbleContent = styled.View<{ isSelf: boolean; hasNewline: boolean }>`
    padding: 8px 15px;
    border-radius: 10px;
    background-color: ${({ isSelf }) => (isSelf ? '#E4F1EE' : '#FFFFFF')};
    flex-shrink: 1;
    max-width: 78%;
`;

const AnnouncementMessageBubble = styled.View`
    padding: 10px 15px;
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

export default MessageBubble;

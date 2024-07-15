import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import Text from '../../common/Text';
import ImageTextButton from "../../common/Button";
import FastImage, { Source } from 'react-native-fast-image';
import { axiosGet } from '../../../axios/axios.method';
import { urls } from '../../../axios/config';
import ProfileImage from "../../common/ProfileImage";
import {sendFriendRequest} from "../../../service/Friends/FriendRelationAPI";
import WebSocketManager from "../../../utils/WebSocketManager";
import {StackNavigationProp} from "@react-navigation/stack";
import {RootStackParamList} from "../../../interfaces";
import {navigate} from "../../../navigation/RootNavigation";


interface UserProfileModalProps {
    visible: boolean;
    onClose: () => void;
    username?: string;
    profileImageId?: number;
    chatRoomType: string;
    chatRoomId: number;
    otherId: number;
    myname: string;
}


const UserProfileModal: React.FC<UserProfileModalProps> = ({
                                                               visible, onClose, username, profileImageId
                                                               , chatRoomType, chatRoomId, otherId, myname
                                                           }) => {

    const [relationCount, setRelationCount] = useState<number | null>(null);

    // Fetch relation function
    const fetchRelation = async (id: number): Promise<number | null> => {
        try {
            const response = await axiosGet(urls.GET_RELATION_URL + `/${id}`, "관계 조회 성공");
            return response?.data?.data.overlapCount;
        } catch (error) {
            console.error('Failed to fetch relation', error);
            return null;
        }
    }


    const handleSend = async (otherId: number, chatRoomId: number, sendername: string) =>{
        const response = await sendFriendRequest(otherId, chatRoomId);
        if (response === true) {
            if (chatRoomType!=='LOCAL'){ // 매치 1:1 채팅일 때만 채팅방에 친구요청 메세지 전송
                WebSocketManager.sendMessage(chatRoomId, sendername+"님이 친구 요청을 보냈습니다.", 'FRIEND_REQUEST');
            }
            // 친구추가 버튼 없애기 버튼 or 요청중 상태 나타내는 것 추가
        }
    };


    useEffect(() => {
        if (visible) {
            fetchRelation(otherId).then(count => setRelationCount(count));
        }
    }, [visible, otherId]);

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
                    <ProfileImage profileImageId={profileImageId}  avatarStyle={styles.profilePictureModal}/>
                    <NameBtnContainer>
                        <Text variant="subtitle">{username}</Text>
                        {chatRoomType === 'FRIEND' ? (
                            // <FastImage
                            //     source={require('../../../assets/Icons/ReportMap.png')}
                            //     style={{ height: 18, width: 24, marginLeft: 6, marginTop: 7 }}
                            //     resizeMode={FastImage.resizeMode.stretch}
                            // />
                            <ImageTextButton
                                style={{ marginTop: 1, marginLeft: 5 }}
                                iconSource={require('../../../assets/Icons/ReportMap.png')}
                                imageStyle={{ height: 25, width: 25 }}
                                onPress={()=> navigate("로그인 성공",{
                                    screen: "친구",
                                    params: {
                                        screen: "스쳐간 기록",
                                        Params: {otherId: otherId}
                                    }
                                })
                                }
                            />
                        ) : (
                            <ImageTextButton
                                style={{ marginTop: 1, marginLeft: 5 }}
                                iconSource={require('../../../assets/Icons/addFriendIcon.png')}
                                imageStyle={{ height: 25, width: 25 }}
                                onPress={()=>handleSend(otherId, chatRoomId, myname)}
                            />
                        )}
                    </NameBtnContainer>
                    <Text variant="sub" style={{ fontSize: 12, marginBottom: 10 }}>
                        {relationCount !== null ? `스친 횟수: ${relationCount}` : "Loading..."}
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

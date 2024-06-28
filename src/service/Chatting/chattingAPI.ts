import {axiosDelete, axiosPatch} from '../../axios/axios.method'; // Adjust the path as necessary
import {Alert} from "react-native";
import WebSocketManager from "../../utils/WebSocketManager";
import axios from "axios";
import {urls} from "../../axios/config";


export const sendFriendRequest = async (chatRoomId:string, otherId: number) => {
    Alert.alert(
        "친구 요청",
        "친구 요청을 보내시겠습니까?",
        [
            {
                text: "취소",
                style: "cancel"
            },
            {
                text: "보내기",
                onPress: async () => {
                    try {
                        await axiosPatch(
                             urls.SEND_FRIEND_REQUEST_URL+`/${chatRoomId}`
                        );

                        // 친구요청 채팅메세지 보내기
                        const messageObject = {
                            type: 'FRIEND_REQUEST',
                            content: "친구 요청을 보냈습니다.",
                        };

                        const messageJson = JSON.stringify(messageObject);
                        console.log('Sending message: ' + messageJson);
                        WebSocketManager.sendMessage(chatRoomId, messageJson);

                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || '친구 요청 전송이 실패했습니다.';
                        Alert.alert("Error", errorMessage);
                    }
                }
            }
        ]
    );
};


export const deleteChat = async (navigation: any, chatRoomId:string) => {
    Alert.alert(
        "채팅방 나가기",
        "정말 나가시겠습니까?",
        [
            {
                text: "취소",
                style: "cancel"
            },
            {
                text: "나가기",
                onPress: async () => {
                    try {
                        await axiosDelete(
                            urls.CHATROOM_LEAVE_URL+`/${chatRoomId}`
                        );
                        Alert.alert("채팅방 삭제 완료", "채팅 목록 화면으로 돌아갑니다.");
                        navigation.navigate('채팅 목록');
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
                        Alert.alert("Error", errorMessage);
                    }
                }
            }
        ]
    );
};

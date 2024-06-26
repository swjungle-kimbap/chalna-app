import axiosInstance from '../../axios/axios.instance'; // Adjust the path as necessary
import {Alert} from "react-native";
import WebSocketManager from "../../utils/WebSocketManager";
import axios from "axios";


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
                        await axiosInstance.patch(
                            `https://chalna.shop/api/v1/relation/request/${chatRoomId}`
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
                        // 친구요청 status 받아서 친구요청 진행중입니다 등 문구 띄우는 걸로 변경
                        Alert.alert("Error", "요청 전송이 실패했습니다.");
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
                        await axiosInstance.delete(
                            `https://chalna.shop/api/v1/chatRoom/leave/${chatRoomId}`
                        );
                        Alert.alert("채팅방 삭제 완료", "채팅 목록 화면으로 돌아갑니다.");
                        navigation.navigate('채팅 목록');
                    } catch (error) {
                        Alert.alert("채팅방 나가기 실패", "채팅방 나가기가 실패했습니다. 연결 상태일 때 다시 시도해주세요.");
                    }
                }
            }
        ]
    );
};

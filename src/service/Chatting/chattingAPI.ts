import {axiosDelete, axiosGet} from '../../axios/axios.method'; // Adjust the path as necessary
import Config from 'react-native-config';
import {Alert} from "react-native";
import {urls} from "../../axios/config";
import {chatroomInfoAndMsg} from "../../interfaces/Chatting.type";
import axiosInstance from "../../axios/axios.instance";
import {ChatRoom} from "../../interfaces/Chatting.type";

export const fetchChatRoomList=async():Promise<ChatRoom[]|any>=>{
    try {
        const response = await axiosGet<{ data: { list: ChatRoom[] } }>(
            urls.CHATROOM_LIST_URL,
        );
        console.log('response from api: ', response.data.data);
        return response.data.data

    } catch (error) {
        console.error(error);
    }
}

// export const viewChatRoomList => {}
export const fetchChatRoomContent =
    async(
        chatRoomId: string, currentUserId: number
    ):Promise<chatroomInfoAndMsg|any> => {
    try{
        // get response
        // console.log("채팅방 입장시 메세지 목록 조회 api 호출");
        console.log('url fetchChatRoomcontent: ', urls.CHATROOM_MSG_URL+`${chatRoomId}`);
        const response = await axiosGet(
            urls.CHATROOM_MSG_URL+`${chatRoomId}` //   ${currentTimestamp}` 나가기 전 createdat 넣어주기
        );
        console.log(response.data.data);

        return response.data.data;
    } catch (error){
        console.log("채팅방 불러오기에 실패했습니다.");
    }
}

export const deleteChat = async (navigation: any, chatRoomId:string):Promise<boolean|any> => {
    Alert.alert(
        "채팅방 나가기",
        "나간 채팅방으로는 재진입이 불가능합니다. 정말 나가시겠습니까?",
        [   { text: "취소", style: "cancel" },
                    { text: "나가기",
                        onPress: async () => {
                            try {
                                await axiosDelete(
                                    urls.CHATROOM_LEAVE_URL+`${chatRoomId}`
                                );
                                Alert.alert("채팅방 삭제 완료", "채팅 목록 화면으로 돌아갑니다.");
                                if (navigation!=='none'){
                                    navigation.navigate('채팅 목록');
                                }
                                return true;
                            } catch (error) {
                                const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
                                Alert.alert("Error", errorMessage);
                                return false;
                            }
                        }}]
    );
};


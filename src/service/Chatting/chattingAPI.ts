import {axiosDelete, axiosGet} from '../../axios/axios.method'; // Adjust the path as necessary
import Config from 'react-native-config';
import {Alert} from "react-native";
import {urls} from "../../axios/config";
import {chatroomInfoAndMsg} from "../../interfaces/Chatting";
import axiosInstance from "../../axios/axios.instance";
import {ChatRoom} from "../../interfaces/Chatting";

export const fetchChatRoomList=async():Promise<ChatRoom[]|any>=>{
    try {
        const response = await axiosGet<{ data: { list: ChatRoom[] } }>(
            urls.CHATROOM_LIST_URL,
        );
        return response.data.data.list
    } catch (error) {
        console.error(error);
    }
}



// export const viewChatRoomList => {}
export const fetchChatRoomContent =
    async(
        chatRoomId: string, lastLeaveAt: string, currentUserId: number
    ):Promise<chatroomInfoAndMsg|any> => {
    try{
        // get response
        const response = await axiosInstance.get(
            urls.CHATROOM_MSG_URL+`/${chatRoomId}/?lastLeaveAt=${lastLeaveAt}` //   ${currentTimestamp}` 나가기 전 createdat 넣어주기
        );
        const responseData = response.data.data;
        // chatRoomType
        const chatRoomType = responseData.type;
        // 사용자명
        const usernames = responseData.members
            .filter((member: any) => member.memberId !== currentUserId)
            .map((member: any) => chatRoomType === 'FRIEND' ? member.username : `익명${member.memberId}`);
        // 메세지 목록
        const fetchedMessages = responseData.list.map((msg: any) => ({
            ...msg,
            isSelf: msg.senderId === currentUserId,
        }));

        return {
            chatRoomType,
            usernames,
            messages: fetchedMessages
        };
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
                                    urls.CHATROOM_LEAVE_URL+`/${chatRoomId}`
                                );
                                Alert.alert("채팅방 삭제 완료", "채팅 목록 화면으로 돌아갑니다.");
                                navigation.navigate('채팅 목록');
                                return true
                            } catch (error) {
                                const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
                                Alert.alert("Error", errorMessage);
                            }   return false
                        }}]
    );
};

import {axiosDelete, axiosGet} from '../../axios/axios.method'; // Adjust the path as necessary
import Config from 'react-native-config';
import {Alert} from "react-native";
import {urls} from "../../axios/config";
import {chatroomInfoAndMsg, chatRoomMemberInfo} from "../../interfaces/Chatting.type";
import axiosInstance from "../../axios/axios.instance";
import {ChatRoom} from "../../interfaces/Chatting.type";
import { showModal } from '../../context/ModalService';

export const fetchChatRoomList=async():Promise<ChatRoom[]|any>=>{
    try {
        const response = await axiosGet<{ data: { list: ChatRoom[] } }>(
            urls.CHATROOM_LIST_URL,
        );
        // console.log('response from api: ', response.data.data);
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

// export const viewChatRoomList => {}
export const fetchChatRoomMember =
    async(chatRoomId: string):Promise<chatRoomMemberInfo|any> => {
        try{

            console.log('url fetchChatRoomMembers: ', urls.CHATROOM_MEMBER_URL+`${chatRoomId}`);
            const response = await axiosGet(
                urls.CHATROOM_MEMBER_URL+`${chatRoomId}` //   ${currentTimestamp}` 나가기 전 createdat 넣어주기
            );
            console.log(response.data.data);
            return response.data.data;
        } catch (error){
            console.log("채팅방 불러오기에 실패했습니다.");
        }
    }



export const deleteChat = async (navigation: any, chatRoomId: string): Promise<boolean | any> => {
    showModal(
      "채팅방 나가기",
      "해당 채팅방을 떠나면 대화 내용이 \n 모두 삭제되고 참여했던 채팅목록에서도 삭제됩니다.",
      async () => {
        try {
          await axiosDelete(
            urls.CHATROOM_LEAVE_URL + `${chatRoomId}`
          );
          if (navigation !== 'none') {
            navigation.navigate('채팅 목록');
          }
          return true;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
          showModal("Error", errorMessage, () => {}, undefined, false);
          return false;
        }
      },
      undefined, // 취소 버튼 클릭 시 수행할 동작이 없으므로 undefined를 전달합니다.
      true, // 취소 버튼을 표시합니다.
      "나가기", // 확인 버튼의 텍스트를 "나가기"로 설정합니다.
      "취소" // 취소 버튼의 텍스트를 "취소"로 설정합니다.
    );
  };


import { axiosPost } from "../axios/axios.method";
import { JoinLocalChatResponse } from "../interfaces";
import { urls } from "../axios/config";
import { navigate } from "../navigation/RootNavigation";

export const joinLocalChat = async (chatRoomId) => {
    try {
    const response = await axiosPost<JoinLocalChatResponse>(
          urls.JOIN_LOCAL_CHAT_URL, "장소 채팅 참여");
    if (response.data.code === "200") {
      navigate("채팅", { chatRoomId });
    } else {
      console.error("장소 채팅 참여 실패:", response.data.message);
    }
  } catch (e) {
    console.error("장소 채팅 참여 중 오류 발생:", e);
  };
          
}
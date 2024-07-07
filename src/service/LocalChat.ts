import { axiosDelete, axiosPost } from "../axios/axios.method";
import { AxiosResponse, JoinLocalChatResponse, LocalChat, Position, SetLocalChatRequest, SetLocalChatResponse } from "../interfaces";
import { urls } from "../axios/config";
import { navigate } from "../navigation/RootNavigation";
import { Alert } from "react-native";
import requestPermissions from "../utils/requestPermissions";
import showPermissionAlert from "../utils/showPermissionAlert";
import { PERMISSIONS } from "react-native-permissions";
import { removeChatRoom } from './Chatting/mmkvChatStorage';
import { calDistance } from "../utils/calDistance";

const requiredPermissions = [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

export const joinLocalChat = async (localChat:LocalChat, currentLocation:Position, setRefresh: Function) => {
    try {
      const distance = calDistance(currentLocation, {latitude: localChat.latitude, longitude: localChat.longitude});
      if (distance < 0.05){
        await axiosPost<JoinLocalChatResponse>(
          urls.JOIN_LOCAL_CHAT_URL + localChat.id.toString(), "장소 채팅 참여");
        setRefresh((prev)=>!prev);
        navigate("채팅", { chatRoomId : localChat.chatRoomId });
      } else 
        Alert.alert("거리 제한", "거리가 너무 멀어요 50m 이내인경우 들어 갈 수 있어요!");
      } catch (e) {
    console.error("장소 채팅 참여 중 오류 발생:", e);
  };
}

export const makeLocalChat = async (name, description, currentLocation) : Promise<LocalChat> => {
  if (name.length && description.length) {
    const response = await axiosPost<SetLocalChatResponse>(
      urls.SET_LOCAL_CHAT_URL, "장소 채팅 만들기", {
      name,
      description,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    } as SetLocalChatRequest);
    
    if (response?.data?.code === "201"){
      Alert.alert("채팅방 생성 완료!", "주위의 사람들과 대화를 나눠보세요!");
    }
    return response?.data?.data;
  } else {
    Alert.alert("내용 부족", "제목과 내용을 채워주세요!",
      [{
          text: '확인',
          style: 'cancel'
      }], { cancelable: true }
    )
    return null;
  }
}

export const handleCheckPermission = async (): Promise<boolean> => {
  const granted = await requestPermissions(requiredPermissions);
  if (!granted) {
    await showPermissionAlert("위치");
    const checkgranted = await requestPermissions(requiredPermissions);
    return checkgranted;
  } 
  return true; 
};


export const localChatJoin = async (localChat:LocalChat, currentLocation:Position, setRefresh:Function) => {
  const granted = await handleCheckPermission();
  if (granted) {
    Alert.alert(localChat.name, localChat.description,
      [
        {
          text: '참가',
          onPress: async () => {await joinLocalChat(localChat, currentLocation, setRefresh)},
          style: 'default'
        },
        { text: '취소', style: 'cancel'}
      ],
      { cancelable: true }
    )
  }
};

export const ChatDisconnectOut = async (chatRoomId:number, setRefresh:Function) => {
  try {
    const response = await axiosDelete<AxiosResponse<string>>(urls.CHATROOM_LEAVE_URL+chatRoomId.toString());
    if (response?.data?.data === "성공")
      Alert.alert("로컬 채팅 종료", "거리가 멀어져 채팅방과 연결이 종료가 되었습니다!");

    removeChatRoom(chatRoomId); 
    setRefresh((prev)=>!prev);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
    Alert.alert("Error", errorMessage);
  }
};

export const ChatOut = async (chatRoomId:number, setRefresh:Function) => {
  try {
    const response = await axiosDelete<AxiosResponse<string>>(urls.CHATROOM_LEAVE_URL+chatRoomId.toString());
    if (response?.data?.data === "성공")
      Alert.alert("로컬 채팅 종료", "채팅방을 성공적으로 나갔습니다.");

    removeChatRoom(chatRoomId); 
    setRefresh((prev)=>!prev);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
    Alert.alert("Error", errorMessage);
  }
};

export const localChatOut = async (localChat:LocalChat, currentLocation:Position, setRefresh:Function) => {
  const granted = await handleCheckPermission();
  if (granted) {
    Alert.alert(localChat.name, "이미 들어간 채팅방입니다! 나가시겠습니까?",
      [
        {
          text: '들어가기',
          onPress: async () => {await joinLocalChat(localChat, currentLocation, setRefresh)},
          style: 'default'
        },
        {
          text: '나가기',
          onPress: async () => await ChatOut(localChat.chatRoomId, setRefresh),
          style: 'default'
        },
      ],
      { cancelable: true }
    )
  }
};

export const localChatDelete = async (localChat:LocalChat, currentLocation:Position, setRefresh: Function) => {
  const granted = await handleCheckPermission();
  if (granted) {
    Alert.alert(localChat.name, "내가 생성한 채팅방입니다! 삭제 하시겠습니까?",
      [  
        {
          text: '들어가기',
          onPress: () => {joinLocalChat(localChat, currentLocation, setRefresh)},
          style: 'destructive'
        },
        {
          text: '삭제',
          onPress: async () =>  {
            try {
              await axiosDelete(urls.DELETE_LOCAL_CHAT_URL+localChat.id.toString(), "장소 채팅 삭제");
              await ChatOut(localChat.chatRoomId, setRefresh);
            } catch (error) {
              const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
              Alert.alert("Error", errorMessage);
            }
          },
          style: 'default'
        },
      ],
      { cancelable: true }
    )
  }
};
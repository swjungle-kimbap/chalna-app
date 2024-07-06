import { axiosDelete, axiosPost } from "../axios/axios.method";
import { JoinLocalChatResponse, SetLocalChatRequest, SetLocalChatResponse } from "../interfaces";
import { urls } from "../axios/config";
import { navigate } from "../navigation/RootNavigation";
import { Alert } from "react-native";
import requestPermissions from "../utils/requestPermissions";
import showPermissionAlert from "../utils/showPermissionAlert";
import { PERMISSIONS } from "react-native-permissions";
import { removeChatRoom } from "../localstorage/mmkvStorage";

const requiredPermissions = [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

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

export const makeLocalChat = async (name, description, currentLocation) => {
  if (name.length && description.length) {
    const response = await axiosPost<SetLocalChatResponse>(
      urls.SET_LOCAL_CHAT_URL, "장소 채팅 만들기", {
      name,
      description,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    } as SetLocalChatRequest);
    
    if (response.data.code === "201"){
      Alert.alert("채팅방 생성 완료!", "주위의 사람들과 대화를 나눠보세요!");
      navigate("채팅", { chatRoomId: response.data.data.chatRoomId });
    }
    return true;
  } else {
    Alert.alert("내용 부족", "제목과 내용을 채워주세요!",
      [{
          text: '확인',
          style: 'cancel'
      }], { cancelable: true }
    )
    return false;
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


export const localChatJoin = async (
  name:string, description:string, chatRoomId:number, isNearby:boolean, setRefresh:Function) => {
  const granted = await handleCheckPermission();
  if (granted) {
    Alert.alert(name, description,
      [
        {
          text: '참가',
          onPress: async () => {
            if (isNearby){
              joinLocalChat(chatRoomId);
              setRefresh((prev)=>!prev);
            } else 
              Alert.alert("거리 제한", "거리가 너무 멀어요 50m 이내인경우 들어 갈 수 있어요!");},
          style: 'default'
        },
        { text: '취소', style: 'cancel'}
      ],
      { cancelable: true }
    )
  }
};

export const localChatOut = async (name:string,chatRoomId:number, setRefresh:Function) => {
  const granted = await handleCheckPermission();
  if (granted) {
    Alert.alert(name, "이미 들어간 채팅방입니다! 나가시겠습니까?",
      [
        {
          text: '들어가기',
          onPress: async () => {navigate("채팅", { chatRoomId })},
          style: 'default'
        },
        {
          text: '나가기',
          onPress: async () => {
            try {
              await axiosDelete(urls.CHATROOM_LEAVE_URL+chatRoomId.toString());
              removeChatRoom(chatRoomId); 
              setRefresh((prev)=>!prev);
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

export const localChatDelete = async (
  name: string, 
  chatRoomId: number, 
  id: number, 
  setRefresh: Function // setRefresh 타입 명시
) => {
  const granted = await handleCheckPermission();
  if (granted) {
    Alert.alert(name, "내가 생성한 채팅방입니다! 삭제 하시겠습니까?",
      [  
        {
          text: '들어가기',
          onPress: async () => {navigate("채팅", { chatRoomId })},
          style: 'destructive'
        },
        {
          text: '삭제',
          onPress: async () =>  {
            try {
              await axiosDelete(urls.DELETE_LOCAL_CHAT_URL+id.toString(), "장소 채팅 삭제");
              await axiosDelete(urls.CHATROOM_LEAVE_URL+chatRoomId.toString());
              removeChatRoom(chatRoomId); 
              setRefresh((prev)=>!prev);
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
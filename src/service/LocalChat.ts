import { axiosPost } from "../axios/axios.method";
import { JoinLocalChatResponse, SetLocalChatRequest, SetLocalChatResponse } from "../interfaces";
import { urls } from "../axios/config";
import { navigate } from "../navigation/RootNavigation";
import { Alert } from "react-native";
import requestPermissions from "../utils/requestPermissions";
import showPermissionAlert from "../utils/showPermissionAlert";
import { PERMISSIONS } from "react-native-permissions";

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
    
    if (response){
      Alert.alert("채팅방 생성 완료!", "주위의 사람들과 대화를 나눠보세요!");
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


export const localChatTapHandler = async (
  name:string, description:string, chatRoomId:number, isNearby:boolean) => {
  const granted = await handleCheckPermission();
  if (granted) {
    Alert.alert(name, description,
      [
        {
          text: '채팅 참가',
          onPress: async () => {
            if (isNearby)
              joinLocalChat(chatRoomId);
            else 
              Alert.alert("거리 제한", "거리가 너무 멀어요 50m 이내인경우 들어 갈 수 있어요!");},
          style: 'default'
        },
      ],
      { cancelable: true }
    )
  }
};
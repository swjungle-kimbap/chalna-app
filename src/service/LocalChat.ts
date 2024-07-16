import { axiosDelete, axiosPost } from "../axios/axios.method";
import { AxiosResponse, JoinLocalChatResponse, LocalChat, Position, SetLocalChatRequest, SetLocalChatResponse } from "../interfaces";
import { urls } from "../axios/config";
import { navigate } from "../navigation/RootNavigation";
import { Alert } from "react-native";
import requestPermissions from "../utils/requestPermissions";
import showPermissionAlert from "../utils/showPermissionAlert";
import { PERMISSIONS } from "react-native-permissions";
import { removeChatRoom } from './Chatting/mmkvChatStorage';
import { showModal } from "../context/ModalService";
import { uploadImage } from "../utils/FileHandling";


const requiredPermissions = [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

export const joinLocalChat = async (localChat:LocalChat, distance:number, setRefresh: Function) => {
    try {
      if (distance < 0.05){
        await axiosPost<JoinLocalChatResponse>(
          urls.JOIN_LOCAL_CHAT_URL + localChat.id.toString(), "장소 채팅 참여");
        setRefresh((prev)=>!prev);
        navigate("채팅", { chatRoomId : localChat.chatRoomId });
      } else 
        showModal('거리 제한', '거리가 너무 멀어요 100m 이내인경우 들어 갈 수 있어요!', ()=>{}, undefined, false)
        
      } catch (e) {
    console.error("장소 채팅 참여 중 오류 발생:", e);
  };
}

export const makeLocalChat = async (name, description, currentLocation, image) : Promise<LocalChat> => {
  const granted = await handleCheckPermission();
  if (!granted)
    return null;

  let fileId = 0;
  if (image){
    const response = await uploadImage(image, "IMAGE");
    fileId = response.fileId;
  }
  
  const response = await axiosPost<SetLocalChatResponse>(
    urls.SET_LOCAL_CHAT_URL, "장소 채팅 만들기", {
    name,
    description,
    imageId: fileId,
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude
  } as SetLocalChatRequest);
  
  if (response?.data?.code === "201"){
    showModal("채팅방 생성 완료!", "주위의 사람들과 대화를 나눠보세요!",()=>{},undefined,false)
  }
  return response?.data?.data;
}

export const handleCheckPermission = async (): Promise<boolean> => {
  const granted = await requestPermissions(requiredPermissions);
  if (granted) 
    return true;

  await showPermissionAlert("위치");
  const checkgranted = await requestPermissions(requiredPermissions);
  return checkgranted;
};


export const localChatJoin = async (localChat:LocalChat, distance:number, setRefresh:Function , imageUri: string) => {
  const granted = await handleCheckPermission();
  if (!granted) {
    return
  }
  showModal(
    localChat.name,
    localChat.description,
    async () => {
      await joinLocalChat(localChat, distance, setRefresh);
    },
    () => {},
    true,
    '참가',
    '취소',
    true,
    'center',
    imageUri,
    false
  );
};

export const ChatDisconnectOut = async (chatRoomId:number, setRefresh:Function) => {
  try {
    const response = await axiosDelete<AxiosResponse<string>>(urls.CHATROOM_LEAVE_URL+chatRoomId.toString());
    if (response?.data?.data === "성공")
    showModal('장소 채팅 종료',"거리가 멀어져 채팅방과 연결이 종료가 되었습니다!", ()=>{}, undefined,false )
    if (setRefresh)
      setRefresh((prev)=>!prev);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
    showModal('찰나가 아파요..','조금만 기다려주세요.',()=>{},undefined,false)
  }
};

export const ChatOut = async (chatRoomId:number, setRefresh:Function) => {
  try {
    const response = await axiosDelete<AxiosResponse<string>>(urls.CHATROOM_LEAVE_URL+chatRoomId.toString());
    if (response?.data?.data === "성공")
    showModal('아쉽네요', '다음에 또 만나요!',()=>{},undefined,false)

    removeChatRoom(chatRoomId); 
    setRefresh((prev)=>!prev);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || '채팅방 나가기가 실패했습니다. 다시 시도해주세요.';
    showModal('찰나가 지금 아파요..','조금만 기다려주세요.',()=>{},undefined,false)
  }
};


export const autolocalChat = async (localChat:LocalChat, distance:number, setRefresh:Function) => {
  const granted = await handleCheckPermission();
  if (!granted) 
    return
  await joinLocalChat(localChat, distance, setRefresh);
};
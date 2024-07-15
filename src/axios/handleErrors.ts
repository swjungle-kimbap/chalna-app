import { AxiosError } from "axios";
import { Alert } from "react-native";
import { navigate } from "../navigation/RootNavigation";
import { urls } from "./config";
import { showModal } from "../context/ModalService";

const handleErrors = (error:AxiosError) => {

  console.log("Bad request Data: ", error.config.data);
  if (error.response?.status === 403) {
    showModal(
      '잘못된 접근 입니다.', 
      '재로그인이 필요합니다.', 
      () => navigate('로그인'), 
      undefined, 
      false
    );
   
    return true
  } else if (error.config.url === urls.SET_LOCAL_CHAT_URL && error.response?.status === 400) {
    showModal('이미 채팅방이 존재합니다!', '주변 다른 채팅방을 참가해보세요!',()=>{},undefined,false);

    return true;
  } else if (/https:\/\/chalna\.shop\/api\/v1\/chatroom\/leave\/\d+/.test(error.config.url) && error.response?.status === 400) {
    return true;
  } else if (/https:\/\/chalna\.shop\/api\/v1\/localchat\/\d+/.test(error.config.url) && error.response?.status === 400) {
    return true;
  }
  return false;
}

export default handleErrors;
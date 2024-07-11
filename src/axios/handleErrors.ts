import { AxiosError } from "axios";
import { Alert } from "react-native";
import { navigate } from "../navigation/RootNavigation";
import { urls } from "./config";

const handleErrors = (error:AxiosError) => {
  console.log("Bad request Data: ", error.config.data);
  if (error.response?.status === 403) {
    Alert.alert('잘못된 접근 입니다.', '재로그인이 필요합니다.');
    navigate('로그인');
    return true
  } else if (error.config.url === urls.SET_LOCAL_CHAT_URL && error.response?.status === 400) {
    Alert.alert("이미 생성된 채팅방 존재", "채팅방은 1개만 만들 수 있습니다!");
    return true;
  } else if (/https:\/\/chalna\.shop\/api\/v1\/chatroom\/leave\/\d+/.test(error.config.url) && error.response?.status === 400) {
    return true;
  } else if (/https:\/\/chalna\.shop\/api\/v1\/localchat\/\d+/.test(error.config.url) && error.response?.status === 400) {
    return true;
  }
  return false;
}

export default handleErrors;
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
    Alert.alert("채팅방 생성 불가", "근처에 다른 로컬 채팅방이 있어 만들 수 없습니다. 위치를 이동해 주세요!");
    return true;
  }
  return false;
}

export default handleErrors;
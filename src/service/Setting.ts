import { Alert } from "react-native";
import { axiosPost } from "../axios/axios.method";
import { deleteKeychain } from "../utils/keychain";
import { navigate } from "../navigation/RootNavigation";
import { urls } from "../axios/config";
import { LogoutResponse } from "../interfaces";

export const logoutAlert = () => {
  Alert.alert("로그아웃", "로그아웃 하시겠습니까?",
    [
      {
        text: '나가기',
        onPress: async () => {
          try {
            await axiosPost<LogoutResponse>(urls.LOGOUT_URL);
            deleteKeychain("loginToken");
            deleteKeychain("accessToken");
            deleteKeychain("refreshToken");
            navigate("로그인")
          } catch (e) {
            console.error("로그 아웃 중 오류 발생:", e);
          };
        },
        style: 'default'
      },
    ],
    {
      cancelable: true,
    },
  )
};
import { Alert } from "react-native";
import { axiosPost } from "../axios/axios.method";
import { deleteKeychain } from "../utils/keychain";
import { navigate } from "../navigation/RootNavigation";
import { urls } from "../axios/config";
import { LogoutResponse } from "../interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Keychain from 'react-native-keychain';

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

export const withdrawlAlert = () => {
  Alert.alert("정말 탈퇴하시겠어요?", "탈퇴 버튼 선택 시, 계정은 삭제되며 복구되지 않습니다.",
    [
      {
        text: '탈퇴',
        onPress: async () => {
          try {
            // await axiosPost(urls.WITHDRAWAL_URL, "회원 탈퇴");
            await AsyncStorage.clear();
            console.log('AsyncStprage 데이터 전부 삭제 완료');
            await Keychain.resetGenericPassword();
            console.log('keychain 데이터 전부 삭제 완료');
          } catch (e) {
            console.error('회원 탈퇴시 문제 발생', e);
          }
        },
        style: 'default'
      },
      {
        text: "취소",
        style: 'cancel'
      },
    ]
  )
}
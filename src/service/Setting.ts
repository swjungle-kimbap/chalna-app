import { Alert } from "react-native";
import { axiosPost } from "../axios/axios.method";
import { navigate } from "../navigation/RootNavigation";
import { urls } from "../axios/config";
import { LogoutResponse } from "../interfaces";
import { loginMMKVStorage, userMMKVStorage } from "../utils/mmkvStorage";
import RNFS from 'react-native-fs';
import FastImage from "react-native-fast-image";

export const logoutAlert = () => {
  Alert.alert("로그아웃", "로그아웃 하시겠습니까?",
    [
      {
        text: '나가기',
        onPress: async () => {
          try {
            await axiosPost<LogoutResponse>(urls.LOGOUT_URL);
            loginMMKVStorage.delete("loginToken");
            loginMMKVStorage.delete("accessToken");
            loginMMKVStorage.delete("refreshToken");
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
          // await axiosPost(urls.WITHDRAWAL_URL, "회원 탈퇴");
          loginMMKVStorage.delete("loginToken");
          loginMMKVStorage.delete("accessToken");
          loginMMKVStorage.delete("refreshToken");
          userMMKVStorage.clearAll();
          loginMMKVStorage.clearAll();
          FastImage.clearDiskCache();
          FastImage.clearMemoryCache();
          navigate("로그인")
          console.log('user Storage 데이터 전부 삭제 완료');
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

export const initUserSetting = () => {
  const isinitialized = userMMKVStorage.getBoolean('mypage.isAlarm');
  if (isinitialized === undefined) {
    userMMKVStorage.set('map.isScanning', false);
    userMMKVStorage.set('map.isBlocked', false);
    userMMKVStorage.set('map.blockedTime', 0);
    userMMKVStorage.set('map.selectedTag', "텍스트");
    userMMKVStorage.set('map.msgText', "");
    userMMKVStorage.set("map.imageUrl", ""); 
    userMMKVStorage.set("map.fileId", 0); 
    userMMKVStorage.set("map.image.ContentType", ""); 
    userMMKVStorage.set('mypage.isAlarm', true);
    userMMKVStorage.set('mypage.isChatAlarm', true);
    userMMKVStorage.set('mypage.isMatchAlarm', true);
    userMMKVStorage.set('mypage.alarmSound', true);
    userMMKVStorage.set('mypage.alarmVibration', true);
    userMMKVStorage.set('mypage.isKeywordAlarm', false);
    userMMKVStorage.set('mypage.isDisturb', false);
    userMMKVStorage.set('mypage.nonDisturbTime', 
      JSON.stringify({doNotDisturbStart: new Date().toString(), doNotDisturbEnd: new Date().toString()}));
    userMMKVStorage.set('bluetooth.advertiseMode', 1);
    userMMKVStorage.set('bluetooth.txPowerLevel', 2);
    userMMKVStorage.set('bluetooth.scanMode', 2);
    userMMKVStorage.set('bluetooth.numberOfMatches', 2);
    userMMKVStorage.set('bluetooth.rssivalue', -100);
    userMMKVStorage.set('matchFCMStorage', JSON.stringify([]));
  }
}
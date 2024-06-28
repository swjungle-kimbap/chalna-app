import  * as KakaoLogin from '@react-native-seoul/kakao-login';
import { axiosPost } from '../../axios/axios.method';
import Config from 'react-native-config';
import { AxiosResponse, LoginResponse, SignUpResponse } from '../../interfaces';
import { SignUpRequest } from '../../interfaces/axiosRequest.type';
import { logIn } from './logIn';
import { setKeychain } from '../../utils/keychain';
import {urls} from "../../axios/config";

export const SignUpByWithKakao = async (deviceId:string, fcmToken:string) :Promise<LoginResponse | null>=> {
  try {
    const kakaoLoginResponse = await KakaoLogin.login();
    const kakaoUserProfile = await KakaoLogin.getProfile();
    const signUpRequestBody: SignUpRequest = {
      accessToken: kakaoLoginResponse.accessToken,
      refreshToken: kakaoLoginResponse.refreshToken,
      username: kakaoUserProfile.nickname,
      kakaoId: kakaoUserProfile.id,
    }
    const singUpResponse = await axiosPost<AxiosResponse<SignUpResponse>>(
      urls.SIGNUP_URL, "회원 가입 요청", signUpRequestBody);
    await setKeychain('loginToken', singUpResponse.data.data.loginToken);
    await KakaoLogin.logout();
    return logIn(singUpResponse.data.data.loginToken, deviceId, fcmToken);
    } catch (error:any) {
    console.error("fail: SignUP by Kakao", error);
    return null
  }
};

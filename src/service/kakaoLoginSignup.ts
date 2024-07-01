import { LoginRequest  } from "../interfaces";
import { axiosPost } from "../axios/axios.method";
import { AxiosResponse } from "axios";
import { LoginResponse } from "../interfaces";
import { getKeychain, setKeychain } from "../utils/keychain";
import  * as KakaoLogin from '@react-native-seoul/kakao-login';
import { SignUpResponse } from '../interfaces';
import { SignUpRequest } from '../interfaces/axiosRequest.type';
import { urls } from "../axios/config";

export const logIn = async (loginToken: string, deviceId:string, fcmToken:string) : Promise<LoginResponse | null>=> {
  try {
    const loginRequestBody:LoginRequest = {
      loginToken, deviceId, fcmToken,
    };
    const accessToken = await getKeychain('accessToken');;
    if (accessToken)
      console.log("accessToken :", accessToken);
    const loginResponse = await axiosPost<AxiosResponse<LoginResponse>>(
      urls.LOGIN_URL, "로그인 요청", loginRequestBody);
    return loginResponse?.data?.data;
  } catch (error) {
    console.error("login fail", error);
    return null;
  }
}

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

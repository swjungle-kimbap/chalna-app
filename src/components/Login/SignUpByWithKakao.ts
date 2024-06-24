import  * as KakaoLogin from '@react-native-seoul/kakao-login';
import { axiosPost } from '../../axios/axios.method';
import Config from 'react-native-config';
import { AxiosResponse, SignUpResponse } from '../../interfaces';
import { SignUpRequest } from '../../interfaces/axiosRequest.type';
import { logIn } from './login';
import { setKeychain } from '../../utils/keychain';

export const SignUpByWithKakao = async (deviceId:string, fcmToken:string) :Promise<boolean>=> {
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
      Config.SIGNUP_URL, "회원 가입 요청", signUpRequestBody);
    await setKeychain('loginToken', singUpResponse.data.data.loginToken);
    await KakaoLogin.logout();
    return logIn(singUpResponse.data.data.loginToken, deviceId, fcmToken);
    } catch (error:any) {
    console.error("fail: SignUP by Kakao", error);
    return false
  }
};

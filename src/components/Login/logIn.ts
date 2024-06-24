import Config from "react-native-config";
import { LoginRequest } from "../../interfaces";
import { axiosPost } from "../../axios/axios.method";
import { AxiosResponse } from "axios";
import { LoginResponse } from "../../interfaces";

export const logIn = async (loginToken: string, deviceId:string, fcmToken:string) : Promise<LoginResponse | null>=> {
  try {
    const loginRequestBody:LoginRequest = {
      loginToken, deviceId, fcmToken,
    };
    const loginResponse = await axiosPost<AxiosResponse<LoginResponse>>(
      Config.LOGIN_URL, "로그인 요청", loginRequestBody);
    return loginResponse?.data?.data;
  } catch (error) {
    console.error("login fail", error);
    return null;
  }
}
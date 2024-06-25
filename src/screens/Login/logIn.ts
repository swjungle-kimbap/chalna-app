import Config from "react-native-config";
import { LoginRequest } from "../../interfaces";
import { axiosPost } from "../../axios/axios.method";
import { AxiosResponse } from "axios";
import { LoginResponse } from "../../interfaces";
import { getKeychain } from "../../utils/keychain";

export const logIn = async (loginToken: string, deviceId:string, fcmToken:string) : Promise<LoginResponse | null>=> {
  try {
    const loginRequestBody:LoginRequest = {
      loginToken, deviceId, fcmToken,
    };
    const accessToken = await getKeychain('accessToken');;
    if (accessToken)
      console.log("accessToken :", accessToken);
    const loginResponse = await axiosPost<AxiosResponse<LoginResponse>>(
      Config.LOGIN_URL, "로그인 요청", loginRequestBody);
    return loginResponse?.data?.data;
  } catch (error) {
    console.error("login fail", error);
    return null;
  }
}
import axios, { AxiosError, AxiosInstance } from "axios";
import { getKeychain, setKeychain } from "../utils/keychain";
import { navigate } from "../navigation/RootNavigation";
import Config from "react-native-config";
import {urls} from "./config";
import { Alert } from "react-native";

const instance: AxiosInstance = axios.create({
  baseURL: Config.BASE_URL+Config.API_BASE_URL,
  withCredentials : true,
})

instance.interceptors.request.use(
  async (axiosConfig) => {
    const refreshToken = await getKeychain('refreshToken');;
    const accessToken = await getKeychain('accessToken');;
    if (!accessToken && axiosConfig.url !== urls.SIGNUP_URL
          && axiosConfig.url !== urls.LOGIN_URL){
      Alert.alert('로그인 필요', '로그인이 필요한 서비스입니다.');
      navigate('로그인');
    } else {
      if (accessToken)
        axiosConfig.headers['Authorization'] = `Bearer ${accessToken}`;
      if (refreshToken)
        axiosConfig.headers['Authorization_Refresh'] = `Bearer ${refreshToken}`;
    }
    return axiosConfig;
  },
  (error:any) => {
    return Promise.reject(error);
  }
)

instance.interceptors.response.use(
  async (response) => {
    const accessToken = response.headers?.authorization;
    const refreshToken = response.headers?.authorization_refresh;
    if (accessToken)
      await setKeychain('accessToken', accessToken);
    if (refreshToken)
      await setKeychain('refreshToken', refreshToken);

    return response
  },
  async (error:AxiosError) => {
    // TODO refresh token logic
    console.log(error.code);
    if (error.response?.status === 403) {
      Alert.alert('잘못된 접근 입니다.', '재로그인이 필요합니다.');
      navigate('로그인');
    }
    return Promise.reject(error);
  }
)

export default instance

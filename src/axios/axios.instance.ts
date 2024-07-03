import axios, { AxiosError, AxiosInstance } from "axios";
import { navigate } from "../navigation/RootNavigation";
import Config from "react-native-config";
import {urls} from "./config";
import { Alert } from "react-native";
import handleErrors from "./handleErrors";
import { loginMMKVStorage } from "../utils/mmkvStorage";

const instance: AxiosInstance = axios.create({
  baseURL: Config.BASE_URL+Config.API_BASE_URL,
  withCredentials : true,
})

instance.interceptors.request.use(
  async (axiosConfig) => {
    const refreshToken = loginMMKVStorage.getString('refreshToken');;
    const accessToken = loginMMKVStorage.getString('accessToken');;
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
      loginMMKVStorage.set('accessToken', accessToken);
    if (refreshToken)
      loginMMKVStorage.set('refreshToken', refreshToken);

    return response
  },
  async (error:AxiosError) => {
    const success = handleErrors(error);
    if (!success)
      return Promise.reject(error);
    else 
      return Promise.resolve();
  }
)

export default instance

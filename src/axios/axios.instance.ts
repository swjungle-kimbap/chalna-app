import axios, { AxiosError, AxiosInstance } from "axios";
import { navigate } from "../navigation/RootNavigation";
import Config from "react-native-config";
import {urls} from "./config";
import { Alert } from "react-native";
import handleErrors from "./handleErrors";
import { loginMMKVStorage } from "../utils/mmkvStorage";
import { showModal } from "../context/ModalService";

const instance: AxiosInstance = axios.create({
  baseURL: Config.BASE_URL+Config.API_BASE_URL,
  withCredentials : true,
})

instance.interceptors.request.use(
  async (axiosConfig) => {
    const refreshToken = loginMMKVStorage.getString('login.refreshToken');;
    const accessToken = loginMMKVStorage.getString('login.accessToken');;
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
      loginMMKVStorage.set('login.accessToken', accessToken);
    if (refreshToken)
      loginMMKVStorage.set('login.refreshToken', refreshToken);

    return response
  },
  async (error:AxiosError) => {
    if (!error.response) {
      showModal("인터넷 연결", "인터넷 연결이 끊어졌어요!", null);
    }
    const success = handleErrors(error);
    if (!success)
      return showModal('찰나가 아파요..','조금만 기다려주세요.',()=>{},undefined,false);
    else 
      return Promise.resolve();
  }
)

export default instance

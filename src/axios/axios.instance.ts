import axios, { AxiosInstance } from "axios";
import { getKeychain } from "../utils/keychain";
import { navigate } from "../navigation/RootNavigation";
import Config from "react-native-config";
import { Alert } from "react-native";

const instance: AxiosInstance = axios.create({
  baseURL:Config.apiUrl,
  withCredentials : true,
})

instance.interceptors.request.use(
  async (axiosConfig) => {
    const accessToken = await getKeychain('accessToken');
    if (!accessToken && axiosConfig.url !== Config.SIGNUP_URL 
          && axiosConfig.url !== Config.LOGIN_URL){
      Alert.alert('로그인 필요', '로그인이 필요한 서비스입니다.');
      navigate('로그인');      
    } else {
      axiosConfig.headers['Authorization'] = accessToken;
    }
    return axiosConfig;
  },
  (error:any) => {
    return Promise.reject(error);
  }
)

instance.interceptors.response.use(
  async (Response) => {
    return Response
  },
  async (error:any) => {
    // TODO refresh token logic
    if (error?.code === "403") {
      try {
        const refreshToken = await getKeychain('refreshToken');
        if (!refreshToken) {
          Alert.alert('로그인 만료', '재로그인이 필요합니다.');
          navigate('로그인');      
        } else {
          // TODO 
        }
      
      } catch (error) {
        console.error("refresh 재발급 실패", error)
      }
    }
    return Promise.reject(error);
  }
)

export default instance
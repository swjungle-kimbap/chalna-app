import axios, { AxiosInstance } from "axios";
import { getKeychain, setKeychain } from "../utils/keychain";
import { navigate } from "../navigation/RootNavigation";
import Config from "react-native-config";
import { Alert } from "react-native";

const instance: AxiosInstance = axios.create({
  baseURL:Config.apiUrl,
  withCredentials : true,
})

instance.interceptors.request.use(
  async (axiosConfig) => {
    console.log(axiosConfig)
    const refreshToken = await getKeychain('refreshToken');;
    const accessToken = await getKeychain('accessToken');;
    if (!accessToken && axiosConfig.url !== Config.SIGNUP_URL 
          && axiosConfig.url !== Config.LOGIN_URL){
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
    const accessToken = response.data.headers?.Authorization;
    const refreshToken = response.data.headers?.Authorization_Refresh;
    if (accessToken)
      await setKeychain('accessToken', accessToken);
    if (refreshToken)
      await setKeychain('refreshToken', refreshToken);
    
    return response
  },
  async (error:any) => {
    // TODO refresh token logic
    if (error?.code === "403") {
      try {
        const refreshToken = await getKeychain('refreshToken');
        if (!refreshToken) {
          Alert.alert('로그인 만료', '재로그인이 필요합니다.');
          navigate('로그인');     
    }  
      } catch (error) {
        console.error("refresh 재발급 실패", error)
      }
    }
    return Promise.reject(error);
  }
)

export default instance
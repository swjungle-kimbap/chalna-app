import axios, { AxiosInstance } from "axios";
import { getKeychain } from "../utils/keychain";
import { navigate } from "../navigation/RootNavigation";
import Config from "react-native-config";

const instance: AxiosInstance = axios.create({
  baseURL:Config.apiUrl,
  withCredentials : true,
})

instance.interceptors.request.use(
  async (axiosConfig) => {
    const accessToken = await getKeychain('accessToken');
    if (!accessToken){
      alert('로그인이 필요합니다.');
      navigate('로그인');      
      return Promise.reject(new Error('No accessToken'));
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
  (Response) => {
    return Response
  },
  (error:any) => {
    // TODO refresh token logic
    return Promise.reject(error);
  }
)

export default instance
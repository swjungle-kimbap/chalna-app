import {axiosGet} from '../../axios/axios.method'; // Adjust the path as necessary
import {urls} from "../../axios/config";
import { AxiosResponse, DownloadFileResponse } from '../../interfaces';
import {friend, friendAPIResponse} from "../../interfaces/Friend.type";


export const fetchFriendList = async ():Promise<friend[]> => {
    const response = await axiosGet<friendAPIResponse>(
        urls.GET_FRIEND_LIST_URL
    )
    console.log("response data: ", response.data.data);
    return response?.data?.data
}

export const fetchFriendRelation = async (otherId: number):Promise<friend|null> => {
    const response = await axiosGet(
        urls.GET_FRIEND_LIST_URL + `/${otherId}`
    )
    return response?.data?.data
}

export const handleDownloadProfile = async (profileId: number) => {
    try {
      const downloadResponse = await axiosGet<AxiosResponse<DownloadFileResponse>>(
            `${urls.FILE_DOWNLOAD_URL}${profileId}`, "프로필 다운로드");
      const { presignedUrl } = downloadResponse.data.data;
      return presignedUrl;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

export const getKoreanInitials = (input: string): string =>{
  const initials: string[] = [
      "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ",
      "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ",
      "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
  ];
  let result: string = "";

  for (let i = 0; i < input.length; i++) {
      const charCode: number = input.charCodeAt(i);
      if (charCode >= 0xAC00 && charCode <= 0xD7A3) {  // Range of Hangul characters
          const base: number = charCode - 0xAC00;
          result += initials[Math.floor(base / 588)];
      } else {
          result += input[i];
      }
  }
  return result;
}

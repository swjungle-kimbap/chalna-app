import {axiosGet} from '../../axios/axios.method'; // Adjust the path as necessary
import {urls} from "../../axios/config";
import { AxiosResponse, DownloadFileResponse } from '../../interfaces';
import {friend, friendAPIResponse, relationAPIResponse, friendRequest} from "../../interfaces/Friend.type";
import Config from "react-native-config";


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

export const fetchReceivedFriendRequest = async ():Promise<friendRequest[]|any> => {
    const response = await axiosGet(
        urls.RECEIVED_FRIEND_REQUEST_URL
        ,"받은 친구 요청 목록 조회 성공"
    )
    return response?.data?.data;
}

export const fetchSentFriendRequest = async ():Promise<friendRequest[]|any> => {
    const response = await axiosGet(
        urls.SENT_FRIEND_REQUEST_URL
        ,"보낸 친구 요청 목록 조회 성공"
    )
    return response?.data?.data;
}

// 상대방과 관계조회시 스친횟수 반환
export const fetchRelation = async (id:number):Promise<Number|null> => {
    const response = await axiosGet(
        urls.GET_RELATION_URL+`/${id}`,
        "관계 조회 성공"
    );
    return response?.data?.data.overlapCount;
}


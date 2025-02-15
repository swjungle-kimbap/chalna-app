import { Position } from "./index";

export interface LoginRequest {
  loginToken: string,
  deviceId: string,
  fcmToken: string,
}

export interface SignUpRequest {
  kakaoId: number,
  username: string,
  accessToken: string,
  refreshToken: string,
}

export interface SendMsgRequest {
  deviceIdList : string[],
  content: string,
  contentType: string
}

export interface GetLocalChatRequest extends Position {
  distance : number,
}

export interface SetLocalChatRequest extends Position{
  name: string,
  description: string,
}

export interface FileRequest {
  fileName : string,
  contentType: string,
  fileSize: number,
  fileType: 'IMAGE' |'PROFILEIMAGE'
}
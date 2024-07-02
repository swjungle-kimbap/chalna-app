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
  deviceIdList : Set<string>,
  message: string,
}

export interface GetLocalChatRequest extends Position {
  distance : number,
}

export interface SetLocalChatRequest extends Position{
  name: string,
  description: string,
}

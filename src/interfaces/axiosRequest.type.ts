import { Position } from "./Location";

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
  receiverDeviceId : string,
  message: string,
  interestTag: string[],
}

export interface GetLocalChatRequest extends Position {
  distance : number,
}

export interface SetLocalChatRequest extends Position{
  name: string,
  description: string,
}

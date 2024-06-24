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
  receiverId : string,
  message: string,
  InterestTag: string[],
}
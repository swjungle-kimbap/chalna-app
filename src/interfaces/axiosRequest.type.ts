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
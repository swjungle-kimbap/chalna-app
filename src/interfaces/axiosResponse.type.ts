export interface AxiosResponse<T> {
  data: T;
  status: number; 
  statusText: string;
}

export interface SignUpResponse {
  loginToken: string,
}

export interface LogoutResponse {
  message: string,
}

export interface LoginResponse {
  message: string,
  username: string,
  profileImageUrl: string,
  id: number,
}

export interface RelationCntResponse {
  friendStatus: string,
  isBlocked: boolean,
  overlapCount: number,
  lastOverlapAt: null,
}

export interface RelationCntResponse {
  friendStatus: string,
  isBlocked: boolean,
  overlapCount: number,
  lastOverlapAt: null,
}

export interface AlarmItem {
  notificationId: number;
  createAt: string;
  message: string;
  senderId: string;
  overlapCount: string;
}

export interface AlarmListResponse {
  code: string,
  data: AlarmItem[]
  message: string,
}

export interface MatchAcceptResponse {
  chatRoomId: number
}

export interface MatchDeleteResponse {
  message: string
}
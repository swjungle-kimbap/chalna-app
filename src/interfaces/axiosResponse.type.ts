import { Position } from "./index";

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
  profileImageId: number,
  id: number,
}

export interface RelationCntResponse {
  friendStatus: string,
  isBlocked: boolean,
  overlapCount: number,
  lastOverlapAt: null,
}

export interface MatchAcceptResponse {
  chatRoomId: number
}

export interface MatchDeleteResponse {
  message: string
}

export interface GetLocalChatResponse {
  code: string,
  data: LocalChatData[],
  message: string
}

export interface LocalChatRoomData extends Position {
  chatRoomId: number,
  distance?: number,
  name: string,
  description: string,
}

export interface LocalChatData {
  localChat: LocalChat,
  isOwner: boolean,
  isJoined: boolean,
}

export interface LocalChat extends Position{
  id: number,
  ownerId: number,
  name: string,
  description: string,
  chatRoomId: number,
  distance?: number,
  imageId: number,
  chatRoomMemberCount: number,
}

export interface SetLocalChatResponse {
  code: string,
  data: LocalChat,
  message: string
}

export interface DeleteLocalChatResponse {
  code: string,
  data: LocalChat,
  message: string
}

export interface JoinLocalChatResponse {
  code: string,
  data: LocalChat,
  message: string
}

export interface FileResponse {
  fileId: number,
  presignedUrl:string
}

export interface DownloadFileResponse {
  presignedUrl:string

}

export interface SendMatchResponse {
  sendCount: number
}

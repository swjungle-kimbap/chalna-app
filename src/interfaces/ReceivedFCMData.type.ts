export interface ChatFCM {
  chatRoomId: string;
  senderId: string;
  message: string;
  senderName: string;
  chatRoomType: string;
  messageType: string;
  createdAt: string;
  image: string;
}

export interface MatchFCM {
  id: string,
  senderId: string,
  receiverId: string,
  message: string,
  createdAt: number,
  overlapCount: string,
}
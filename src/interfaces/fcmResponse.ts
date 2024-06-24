export interface PushMessage {
  to: string,
  data: {
    senderId: string,
    message: string,
    createdAt: string,
    additionalData: string,
  }
  android: {
    priority: "high"
  }
}

export interface ChatPushAlarm {
  fcmType: string,
  chatRoomId: number,
  senderName: string,
  messageType: string,
}

export interface MatchPushAlarm {
  fcmType: string
}
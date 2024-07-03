export type User = {
  id:string,
  username:string,
  message:string,
};

export interface Position {
  latitude: number;
  longitude: number;
}
  
export interface SavedMessageData {
  msgText: string,
  isScanning: boolean,
  isBlocked: boolean,
  blockedTime: number,
}

export interface SavedNonDisturbTime {
  doNotDisturbStart: string,
  doNotDisturbEnd: string,
}

export interface SavedKeywords {
  interestKeyword: string[],
}
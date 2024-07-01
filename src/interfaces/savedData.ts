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
  selectedTag: string,
  isScanning: boolean,
  isBlocked: boolean,
  blockedTime: number,
}
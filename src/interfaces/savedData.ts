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

export interface SavedMypageData {
  isAlarm: boolean
  isKeywordAlarm: boolean,
  isFriendAlarm: boolean,
  isMatchAlarm: boolean,
  alarmSound: boolean,
  alarmVibration: boolean,
  isDisturb : boolean,
}

export interface SavedDisturbTime {
  doNotDisturbStart: string,
  doNotDisturbEnd: string,
}

export interface SavedKeywords {
  interestKeyword: string[],
}
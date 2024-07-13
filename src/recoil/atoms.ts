import { atom } from "recoil";
import { LocalChatData, LoginResponse, Position } from "../interfaces";

export const locationState = atom<Position>({
  key: 'location',
  default: {
    latitude: 37.5030426,
    longitude: 127.041588,
  }
})

export const userInfoState = atom<LoginResponse>({
  key: 'userInfo',
  default: {
    message : "",
    username : "",
    profileImageId: 0,
    id : 0,
  }
})

export const AlarmCountState = atom<number>({
  key: 'AlaramCount',
  default: 0
  }
)

export const DeviceUUIDState = atom<string>({
  key: 'DeviceUUID',
  default: ''
})

export const getLocalChatRefreshState = atom<boolean>({
  key: 'getLocalChatRefresh',
  default: false,
})

export const isKeywordAlarmState = atom<boolean>({
  key: 'isKeywordAlarm',
  default: false,
})

export const isDisturbState = atom<boolean>({
  key: 'isDisturb',
  default: false,
})

export const isRssiTrackingState = atom<boolean>({
  key: 'isRssiTracking',
  default: false,
})

export const FlyingModeState = atom<boolean>({
  key: 'flyingMode',
  default: false,
})

export const DeveloperModeState = atom<boolean>({
  key: 'DeveloperMode',
  default: false,
})

export const MsgSendCntState = atom<number>({
  key: 'MsgSendCnt',
  default: 0,
})

export const LocalChatListState = atom<LocalChatData[]>({
  key: 'LocalChatList',
  default: []
})
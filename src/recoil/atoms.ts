import { atom } from "recoil";
import { LoginResponse, Position } from "../interfaces";
import { IsNearbyState } from "./atomtypes";
import { Friend } from "../screens/Friends/FriendsScreen";

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
    profileImageUrl : "",
    id : 0,
  }
})

export const AlarmCountState = atom<number>({
  key: 'AlaramCount',
  default: 0
  }
)

export const showMsgBoxState = atom<boolean>({
  key: 'showMsgBox',
  default: false
  }
)

export const isNearbyState = atom<IsNearbyState>({
  key: 'isNearby',
  default: {
    isNearby: false,
    lastMeetTime: 0
  }
})

export const FriendsListState = atom<Friend[]>({
  key: 'FriendsList',
  default: []
})

export const JoinedLocalChatListState = atom({
  key: 'JoinedLocalChatList',
  default: []
})

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
  key: 'isDisturbState',
  default: false,
})
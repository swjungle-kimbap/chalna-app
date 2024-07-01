import { atom } from "recoil";
import { LoginResponse, Position } from "../interfaces";
import { IsNearbyState } from "./atomtypes";
import { EmitterSubscription } from 'react-native';
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

export const onDeviceFoundState = atom<EmitterSubscription | null>({
  key: 'onDeviceFound',
  default: null
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
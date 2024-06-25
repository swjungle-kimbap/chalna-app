import { atom } from "recoil";
import { LoginResponse, Position } from "../interfaces";
import { ToggleValueState } from "./atomtypes";

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

export const isScanningToggleState = atom<boolean>({
  key: 'isScanningToggle',
  default: false
  }
)

export const isSendingMsgToggleState = atom<boolean>({
  key: 'isSendingMsgToggle',
  default: false
  }
)
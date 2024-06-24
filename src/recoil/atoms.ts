import {atom, useRecoilValue} from "recoil";
import { LoginResponse, Position } from "../interfaces";

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

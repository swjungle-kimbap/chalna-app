import { atom } from "recoil";
import { Position } from "../interfaces";

export const locationState = atom<Position>({
  key: 'location',
  default: {
    latitude: 37.5030426,
    longitude: 127.041588,
  }
})
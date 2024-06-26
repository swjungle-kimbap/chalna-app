import { NavigationContainerRef } from "@react-navigation/native";
import React from "react";

export const isReadyRef = React.createRef<boolean>();
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export const navigate = (path: any, params?:object) => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.navigate(path, params);
  } else {
    console.log('base navigator 준비 안됨');
  }
}
import { NavigationContainerRef } from "@react-navigation/native";
import React from "react";

export const isReadyRef = React.createRef<boolean>();
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export const navigate = (name: string, params?:object) => {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    console.log('base navigator 준비 안됨');
  }
}
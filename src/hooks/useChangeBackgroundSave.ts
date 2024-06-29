import { MutableRefObject, useEffect } from "react";
import { AppStateStatus, AppState } from "react-native";
import { setAsyncString, setAsyncObject } from "../utils/asyncStorage";

const useChangeBackgroundSave = <T>(key: string, saveData:T) => {
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        if (typeof saveData === 'string') {
          await setAsyncString(key, saveData);
        } else {
          await setAsyncObject<T>(key, saveData);
        }
      }
    };
    
    const subscription = AppState.addEventListener(`change`, handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);
};

export default useChangeBackgroundSave;
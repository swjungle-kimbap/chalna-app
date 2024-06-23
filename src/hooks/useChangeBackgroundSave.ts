import { MutableRefObject, useEffect } from "react";
import { AppStateStatus, AppState } from "react-native";
import { setAsyncString, setAsyncObject } from "../utils/asyncStorage";

const useChangeBackgroundSave = <T>(key: string, saveRef:MutableRefObject<T>, saveData:T) => {
  useEffect(() => {
    saveRef.current = saveData;
  }, [saveData]);
  
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        if (typeof saveRef.current === 'string') {
          await setAsyncString(key, saveRef.current);
        } else {
          await setAsyncObject<T>(key, saveRef.current);
        }
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);
};

export default useChangeBackgroundSave;
import { useCallback, useEffect } from "react";
import { AppStateStatus, AppState } from "react-native";
import { setMMKVObject, setMMKVString } from "../utils/mmkvStorage";

const useChangeBackgroundSave = <T>(key: string, saveData: T) => {
  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        console.log(saveData, "savedData in saving");
        if (typeof saveData === 'string') {
          setMMKVString(key, saveData);
        } else {
          setMMKVObject<T>(key, saveData);
        }
      }
    },
    [key, saveData]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);
};

export default useChangeBackgroundSave;
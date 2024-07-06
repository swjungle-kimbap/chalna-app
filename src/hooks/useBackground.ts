import { useCallback, useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native";
import { startBackgroundService, endBackgroundService } from "../service/Background";

const useBackground = (isScanning: boolean) => {
  const appState = useRef(AppState.currentState);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        const endService = async () => {
          await endBackgroundService();
        } 
        endService();
      } else if (nextAppState === 'background') {
        console.log('App has gone to the background!');
        const checkIsScanning = async () => {
          if (isScanning) {
            console.log('Scanning is continued in background!');
            await startBackgroundService(); 
          }
        } 
        checkIsScanning();
      }
      appState.current = nextAppState;
    },
    [isScanning]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange])
}

export default useBackground;
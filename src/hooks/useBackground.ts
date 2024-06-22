import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native";
import { startBackgroundService, endBackgroundService } from "../service/BackgroundTask";

const useBackground = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        endBackgroundService();
      } else if (nextAppState === 'background') {
        console.log('App has gone to the background!');
        startBackgroundService(); 
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

}

export default useBackground;
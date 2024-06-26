import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native";
import { startBackgroundService, endBackgroundService } from "../service/BackgroundTask";
import { getAsyncString } from "../utils/asyncStorage";
import { ScanNearbyStop } from "../service/ScanNearbyAndPost";

const useBackground = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        const endService = async () => {
          await endBackgroundService();
        } 
        endService();
        
      } else if (nextAppState === 'background') {
        console.log('App has gone to the background!');
        const checkIsScanning = async () => {
          const isScaaningString = await getAsyncString('isScanning');
          if (isScaaningString === 'true') {
            //await ScanNearbyStop();
            console.log('Scanning is continued in background!');
            await startBackgroundService(); 
          }
        } 
        checkIsScanning();
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
import BleButton from "./BleButton";
import Messagebox from "./MessageBox";
import  { useState, useEffect, useRef } from 'react';
import ScanNearbyAndPost, { ScanNearbyStop } from '../../service/ScanNearbyAndPost';
import { getKeychain } from '../../utils/keychain';
import { EmitterSubscription } from 'react-native';
import { getAsyncString, setAsyncString } from "../../utils/asyncStorage";
import showPermissionAlert from '../../utils/showPermissionAlert';
import requestPermissions from '../../utils/requestPermissions';
import requestBluetooth from '../../utils/requestBluetooth';
import { PERMISSIONS } from 'react-native-permissions';
import { isNearbyState } from "../../recoil/atoms";
import { useRecoilState } from "recoil";

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];


const ScanButtons = () => {
  const [nearInfo, setNearInfo] = useRecoilState(isNearbyState);
  const onDeviceFoundRef = useRef<EmitterSubscription | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const uuidRef = useRef<string>('');

  useEffect(() => {
    const fetchSavedData = async () => {
      const uuid = await getKeychain('deviceUUID');
      if (uuid)
        uuidRef.current = uuid;

      const savedIsScanning = await getAsyncString('isScanning');
      if (savedIsScanning === 'true'){
        setIsScanning(true);
        const savedIsSendingMsg = await getAsyncString('isSendingMsg');
        if (savedIsSendingMsg === 'true')
          setIsSendingMsg(true);
      }
    };
    fetchSavedData();
    return () => {
      if (onDeviceFoundRef.current){
        onDeviceFoundRef.current.remove();
        onDeviceFoundRef.current = null;
      }
    }
  }, []);

  const handleSetIsNearby = () => {
    const currentTime = new Date().getTime(); 
    if (nearInfo.lastMeetTime + 3000 < currentTime)
      setNearInfo({isNearby: true, lastMeetTime: currentTime});
  }

  const startScan = async () => {
    if (!onDeviceFoundRef.current) {
      const listener = await ScanNearbyAndPost(uuidRef.current, handleSetIsNearby);
      onDeviceFoundRef.current = listener;
    }
  };

  const stopScan = async () => {
    if (isScanning) {
      ScanNearbyStop();
      if (onDeviceFoundRef.current){
        onDeviceFoundRef.current.remove();
        onDeviceFoundRef.current = null;
      }
    }
  };

  const handleCheckPermission = async (): Promise<boolean> => {
    const granted = await requestPermissions(requiredPermissions);
    const checkNotBluetooth = await requestBluetooth();
    if (!granted || !checkNotBluetooth) {
      await showPermissionAlert();
      const granted = await requestPermissions(requiredPermissions);
      if (granted && checkNotBluetooth) {
        return true;
      } else {
        return false;
      }
    } else {
      return true; 
    }
  };

  const handleSendingMessage = async () => {
    if (!isSendingMsg) {
      if (!isScanning) {
        const hasPermission = await handleCheckPermission();
        if (hasPermission) {
          await startScan();
          setIsScanning(true);
          await setAsyncString('isScanning', 'true');
          setIsSendingMsg(true);  
          await setAsyncString('isSendingMsg', 'true');
        } else {
          await setAsyncString('isScanning', 'false');
        }
      } else {
        await setAsyncString('isSendingMsg', 'true');
        setIsSendingMsg(true);      
      }
    } else {
      await setAsyncString('isSendingMsg', 'false');
      setIsSendingMsg(false);   
    }
  }

  const bleHanddler = async () => {
    if (!isScanning) {
      const hasPermission = await handleCheckPermission();
      if (hasPermission) {
        await startScan();
        await setAsyncString('isScanning', 'true');
        setIsScanning(true);
      } else {
        await setAsyncString('isScanning', 'false');
        setIsScanning(false);
      } 
    } else {
      //await stopScan();
      if (isSendingMsg) {
        await setAsyncString('isSendingMsg', 'false');
        setIsSendingMsg(false);   
      }
      setIsScanning(false);
      await setAsyncString('isScanning', 'false');
    }
  };

  return (
    <>
      <BleButton bleON={isScanning} bleHanddler={bleHanddler}/>
      <Messagebox isSendingMsg={isSendingMsg} handleSendingMessage={handleSendingMessage}/>
    </>
  );
}

export default ScanButtons;
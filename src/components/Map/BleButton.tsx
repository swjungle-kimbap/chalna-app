import RoundBox from "../../components/common/RoundBox";
import Button from '../../components/common/Button';
import { useRecoilState } from "recoil";
import { isScanningToggleState, isSendingMsgToggleState } from "../../recoil/atoms";
import { StyleSheet, EmitterSubscription } from 'react-native';
import requestBluetooth from "../../utils/requestBluetooth";
import showPermissionAlert from "../../utils/showPermissionAlert";
import requestPermissions from "../../utils/requestPermissions";
import { PERMISSIONS } from "react-native-permissions";
import  { useState, useEffect, useRef } from 'react';
import ScanNearbyAndPost, { ScanNearbyStop } from '../../service/ScanNearbyAndPost';
import { getAsyncString, setAsyncString } from "../../utils/asyncStorage";
import { getKeychain } from '../../utils/keychain';

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];


const BleButton = ({disable}) => {
  const [bleON, setBleOn] = useRecoilState(isScanningToggleState);
  const [isSendingMsg, setIsSendingMsg] = useRecoilState<boolean>(isSendingMsgToggleState);
  const onDeviceFoundRef = useRef<EmitterSubscription | null>(null);
  const [deviceUUID, setDeviceUUID] = useState<string>('');

  useEffect(() => {
    const fetchSavedData = async () => {
      const uuid = await getKeychain('deviceUUID');
      if (uuid)
        setDeviceUUID(uuid);

      const savedIsScanning = await getAsyncString('isScanning');
      if (savedIsScanning){
        setBleOn(true);
      }
    };
    fetchSavedData();
  }, []);

  const handleCheckPermission = async (): Promise<boolean> => {
    const checkNotBluetooth = await requestBluetooth();
    if (disable || !checkNotBluetooth) {
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
  
  const startScan = async () => {
    if (!onDeviceFoundRef.current) {
      if (onDeviceFoundRef.current) {
        onDeviceFoundRef.current.remove();
        onDeviceFoundRef.current = null;
      }
      const listener = await ScanNearbyAndPost(deviceUUID);
      onDeviceFoundRef.current = listener;
    }
  };

  const stopScan = async () => {
    if (bleON) {
      ScanNearbyStop();
      if (onDeviceFoundRef.current){
        onDeviceFoundRef.current.remove();
        onDeviceFoundRef.current = null;
      }
    }
  };

  const bleHanddler = async () => {
    if (!bleON) {
      const hasPermission = await handleCheckPermission();
      if (hasPermission) {
        await startScan();
        await setAsyncString('isScanning', 'true');
        setBleOn(true);
      } else {
        await setAsyncString('isScanning', 'false');
        setBleOn(false);
      } 
    } else {
      await stopScan();
      if (isSendingMsg) {
        await setAsyncString('isSendingMsg', 'false');
        setIsSendingMsg(false);   
      }
      setBleOn(false);
      await setAsyncString('isScanning', 'false');
    }
  };

  return (
    <RoundBox style={styles.bleButton}>
    <Button iconSource={require('../../assets/Icons/bluetoothIcon.png')}
      imageStyle={{
        width:30,
        height:30,
        tintColor: bleON ? '#14F12A' : '#979797' 
      }}
      onPress={bleHanddler}></Button>
  </RoundBox>
  );
}

const styles = StyleSheet.create({
  bleButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
    left: 20,
    height: 40, 
    width: 40,
    borderRadius: 20, 
    paddingVertical: 2, // 상하 여백 설정
    paddingHorizontal: 3, // 좌우 여백 설정
    zIndex:3
  },
})

export default BleButton;
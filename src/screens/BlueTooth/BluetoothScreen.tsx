import { Animated, NativeEventEmitter, NativeModules, StyleSheet, View } from "react-native";
import AlarmButton from "../../components/Bluetooth/AlarmButton";
import MessageBox from "../../components/Bluetooth/MessageBox";
import Text from "../../components/common/Text";
import BleButton from "../../components/Bluetooth/BleButton";
import { useMMKVBoolean, useMMKVNumber, useMMKVString } from "react-native-mmkv";
import { userMMKVStorage } from "../../utils/mmkvStorage";
import ScanNearbyAndPost, { ScanNearbyStop } from "../../service/Bluetooth";
import { useRecoilState, useRecoilValue } from "recoil";
import { DeviceUUIDState, isRssiTrackingState, showMsgBoxState } from "../../recoil/atoms";
import requestPermissions from "../../utils/requestPermissions";
import requestBluetooth from "../../utils/requestBluetooth";
import showPermissionAlert from "../../utils/showPermissionAlert";
import { PERMISSIONS } from "react-native-permissions";
import { useEffect, useRef, useState } from "react";
import RoundBox from "../../components/common/RoundBox";
import useBackground from "../../hooks/useBackground";
import { axiosPost } from "../../axios/axios.method";
import { AxiosResponse, SendMatchResponse, SendMsgRequest } from "../../interfaces";
import { urls } from "../../axios/config";
import { addDevice } from "../../service/Background";
import KalmanFilter from 'kalmanjs'
import RssiTracking from "../../components/Bluetooth/RssiTracking";

interface BluetoothScreenPrams {
  route: {
    params?: {
      notificationId? : string;
    }
  }
}

interface BleScanInfo {
  advFlag: number,
  companyId: number,
  deviceAddress: string,
  deviceName: string|null,
  manufData: number[],
  rssi: number,
  serviceUuids: string[],
  txPower: number,
}

const uuidSet = new Set<string>(); 
const uuidTime = new Map(); 
const uuidTimeoutID = new Map();
const kFileters = new Map();
const scanDelayedTime = 5 * 1000;
const sendDelayedTime = 60 * 1000;

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

const BluetoothScreen: React.FC<BluetoothScreenPrams> = ({ route }) => {
  const { notificationId = "" } = route.params ?? {};
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const isRssiTracking = useRecoilValue(isRssiTrackingState);
  const deviceUUID = useRecoilValue(DeviceUUIDState);
  const [msgText, setMsgText] = useMMKVString("map.msgText", userMMKVStorage);
  const [isScanning, setIsScanning] = useMMKVBoolean("map.isScanning", userMMKVStorage);
  const [isBlocked, setIsBlocked] = useMMKVBoolean("map.isBlocked", userMMKVStorage);
  const [blockedTime, setBlockedTime] = useMMKVNumber("map.blockedTime", userMMKVStorage);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const sendCountsRef = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [showTracking, setShowTracking] = useState(false);
  const [rssiMap, setRssiMap] = useState<Map<string, number>>(null);
  const [selectedTag, setSelectedTag] = useMMKVString("map.selectedTag", userMMKVStorage); 
  const [imageUrl, setImageUrl] = useMMKVString("map.imageUrl", userMMKVStorage); 
  const [fileId, setFileId] = useMMKVNumber("map.fileId", userMMKVStorage); 
  const [selectedImage, setSelectedImage] = useState(null);
  useBackground(isScanning);

  useEffect(() => {
    if (!isScanning) {
      handleBLEButton();
    }

    if (isScanning) {
      ScanNearbyAndPost(deviceUUID);
    }
    if (isBlocked) {
      const restBlockedTime = sendDelayedTime - (Date.now() - blockedTime);
      if (restBlockedTime > 0) {
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), restBlockedTime);
      } else {
        setIsBlocked(false);
      }
    }
  }, [])


  const updateRssi = (uuid: string, rssi: number) => {
    setRssiMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(uuid, rssi);
      return newMap;
    });
  };

  const handleSetIsNearby = (uuid: string, rssi:number, isBlocked = false) => {
    const currentTime = new Date().getTime();
    if (isRssiTracking)
      updateRssi(uuid, rssi);

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    if (isBlocked) {
      if (uuidSet.size > 0) {
        uuidSet.clear();
        uuidTime.clear();
        for (const timeoutId of Object.values(uuidTimeoutID)) {
          clearTimeout(timeoutId);
        }
        uuidTimeoutID.clear();
      }
      return;
    }

    if (!uuidSet.has(uuid)) {
      uuidSet.add(uuid);
    } else {
      if (uuidTimeoutID[uuid]) {
        clearTimeout(uuidTimeoutID[uuid]);
      }
    }
    uuidTime[uuid] = currentTime;
    uuidTimeoutID[uuid] = setTimeout(() => {
      uuidSet.delete(uuid)
      if (isRssiTracking) {
        setRssiMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(uuid);
          return newMap;
        });
      }
    }, scanDelayedTime)
  };

  useEffect(() => {
    const RSSIvalue =  userMMKVStorage.getNumber("bluetooth.rssivalue");
    const { BLEAdvertiser } = NativeModules;
    const eventEmitter = new NativeEventEmitter(BLEAdvertiser);
    eventEmitter.removeAllListeners('onDeviceFound');
    eventEmitter.addListener('onDeviceFound', (event: BleScanInfo) => {
        for (let i = 0; i < event.serviceUuids.length; i++) {
          if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
            if (isRssiTracking) {
              let kf = kFileters[event.serviceUuids[i]];
              if (!kf) {
                kFileters[event.serviceUuids[i]] = new KalmanFilter();
                kf = kFileters[event.serviceUuids[i]];
              }
              const filterdRSSI = kf.filter(event.rssi)
              if (filterdRSSI < RSSIvalue) return;
              handleSetIsNearby(event.serviceUuids[i], filterdRSSI, isBlocked);
            } else {
              handleSetIsNearby(event.serviceUuids[i], event.rssi, isBlocked);
            }
            addDevice(event.serviceUuids[i], new Date().getTime());
          }
        }
      })
  }, [isScanning, isBlocked, isRssiTracking, handleSetIsNearby])


  const startScan = async () => {
    if (!isScanning) {
      ScanNearbyAndPost(deviceUUID);
      setIsScanning(true);
    }
  };

  const stopScan = async () => {
    if (isScanning) {
      ScanNearbyStop();
      setIsScanning(false);
    }
  };

  const handleCheckPermission = async (): Promise<boolean> => {
    const granted = await requestPermissions(requiredPermissions);
    const checkNotBluetooth = await requestBluetooth();
    if (!granted || !checkNotBluetooth) {
      await showPermissionAlert("블루투스와 위치");
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

  const handleBLEButton = async () => {
    await handleCheckPermission()
    if (!isScanning)
      startScan();
    else if (isScanning) {
      stopScan();
    }
  };

  const sendMsg = async ( uuids:Set<string>, fileId : number ) => {
    let response = null;
    if (selectedTag ==='텍스트') {
      response = await axiosPost<AxiosResponse<SendMatchResponse>>(urls.SEND_MSG_URL, "인연 보내기", {
        deviceIdList: Array.from(uuids),
        content: msgText,
        contentType: 'MESSAGE'
      } as SendMsgRequest)
    } else {
      response = await axiosPost<AxiosResponse<SendMatchResponse>>(urls.SEND_MSG_URL, "인연 보내기", {
        deviceIdList: Array.from(uuids),
        content: fileId.toString(),
        contentType: 'FILE'
      } as SendMsgRequest)
    }
    sendCountsRef.current = response?.data?.data?.sendCount;
  } 

  const handleSendMsg = async (updateFileId) => {
    await sendMsg(uuidSet, updateFileId);
  }
  
  return (
    <>
      {isRssiTracking && (
        <>
          <RoundBox style={styles.TVButton}>
            <Button title='CCTV' onPress={()=>setShowTracking(true)} titleStyle={{color: '#979797' , fontSize: 10}}/>
          </RoundBox>
          <RssiTracking closeModal={()=>setShowTracking(false)} modalVisible = {showTracking} items={rssiMap}/>
        </>
      )} 
      <View style={styles.background}>
        <BleButton bleON={isScanning} bleHanddler={handleBLEButton} />
        <AlarmButton notificationId={notificationId} />
        <MessageBox  handleSendMsg={handleSendMsg}/>
        <View style={styles.contentContainer}>
          <Text style={styles.findText}>내 주변의 인연을 찾고 있습니다.</Text>
          <RoundBox style={styles.content}>
            <Text>디자인</Text>
          </RoundBox>
          {isScanning ? (
            <Text style={styles.searchText}>탐색중</Text>
          ) : (
            <>
              <Text style={styles.notSearchText}>주변의 사람을 만날 수 있도록 블루투스 버튼을 눌러 주세요!</Text>
              {/* Add additional conditions here to handle other states like "인연을 찾았을 때" */}
            </>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    marginTop: 50,
    marginBottom: 70,
    height: 200,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    backgroundColor: "#fff",
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  findText: {
    fontSize: 20,
    marginBottom: 20,
  },
  searchText: {
    fontSize: 30,
    marginTop: 20,
  },
  notSearchText: {
    fontSize: 16,
    color: 'blue',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default BluetoothScreen;

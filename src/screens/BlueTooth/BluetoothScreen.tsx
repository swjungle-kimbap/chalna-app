import { SafeAreaView, Animated, Modal, NativeEventEmitter, NativeModules, StyleSheet, TouchableWithoutFeedback, View, Image, Dimensions } from "react-native";
import AlarmButton from "../../components/Bluetooth/AlarmButton";
import MessageBox from "../../components/Bluetooth/MessageBox";
import Text from "../../components/common/Text";
import BleButton from "../../components/Bluetooth/BleButton";
import { useMMKVBoolean, useMMKVNumber } from "react-native-mmkv";
import { userMMKVStorage } from "../../utils/mmkvStorage";
import ScanNearbyAndPost, { ScanNearbyStop } from "../../service/Bluetooth";
import { useRecoilState, useRecoilValue } from "recoil";
import { DeviceUUIDState, isRssiTrackingState, MsgSendCntState } from "../../recoil/atoms";
import requestPermissions from "../../utils/requestPermissions";
import requestBluetooth from "../../utils/requestBluetooth";
import showPermissionAlert from "../../utils/showPermissionAlert";
import { PERMISSIONS } from "react-native-permissions";
import { useEffect, useRef, useState } from "react";
import useBackground from "../../hooks/useBackground";
import { addDevice } from "../../service/Background";
import KalmanFilter from 'kalmanjs';
import RssiTracking from "../../components/Bluetooth/RssiTracking";
import Button from '../../components/common/Button';
import DancingText from "../../components/Bluetooth/DancingText";
import useFadeText from "../../hooks/useFadeText";
import BleMainComponent from "../../components/Bluetooth/BleMainComponent";
import BleBottomComponent from "../../components/Bluetooth/BleBottomComponent";
import color from "../../styles/ColorTheme";
import MessageGif from "../../components/Bluetooth/MessageGif";
import styles from "../../components/Bluetooth/BleComponent.style";

interface BluetoothScreenPrams {
  route: {
    params?: {
      notificationId?: string;
    }
  }
}

interface BleScanInfo {
  advFlag: number,
  companyId: number,
  deviceAddress: string,
  deviceName: string | null,
  manufData: number[],
  rssi: number,
  serviceUuids: string[],
  txPower: number,
}

const scanDelayedTime = 4 * 1000;
const sendDelayedTime = 30 * 1000;
const maxScanDelayedTime = 10 * 1000;
const DeviceAddDelayedTime = 4 * 60 * 60 * 1000;

// 주영 테스트
const uuidSet2 = new Set<string>();

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

const BluetoothScreen: React.FC<BluetoothScreenPrams> = ({ route }) => {
  const { notificationId = "" } = route.params ?? {};
  const isRssiTracking = useRecoilValue(isRssiTrackingState);
  const deviceUUID = useRecoilValue(DeviceUUIDState);
  const [isScanning, setIsScanning] = useMMKVBoolean("map.isScanning", userMMKVStorage);
  const [isBlocked, setIsBlocked] = useMMKVBoolean("map.isBlocked", userMMKVStorage);
  const [blockedTime, setBlockedTime] = useMMKVNumber("map.blockedTime", userMMKVStorage);
  const [showTracking, setShowTracking] = useState(false);
  const [rssiMap, setRssiMap] = useState<Map<string, number>>(null);
  const [remainingTime, setRemainingTime] = useState(30);
  const [showMsgBox, setShowMsgBox] = useState(false);
  const [fadeInAndMoveUp, fadeAnim, translateY] = useFadeText();
  const [uuids, setUuids] = useState<Set<string>>(new Set()); // useState 사용

  const uuidSet = useRef(new Set<string>());
  const uuidTime = useRef(new Map());
  const uuidTimeoutID = useRef(new Map());
  const kFileters = useRef(new Map());
  const lastProcessed = useRef(new Map());
  const lastDeviceAddProcessed = useRef(new Map());
  const backgroundAddProcessed = useRef(new Map());

  //테스트용 임니당
  const [uuids2, setUuids2] = useState<Set<string>>(new Set());
  const [uuidSet2, setUuidSet2] = useState(new Set<string>());
  const desiredCount = 6; // 원하는 갯수 설정

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setUuidSet2((prevSet) => {
  //       const newSet = new Set(prevSet);
  //       if (newSet.size === 0) {
  //         for (let i = 0; i < desiredCount; i++) {
  //           newSet.add(`random-uuid-${i + 1}`);
  //         }
  //       } else {
  //         newSet.clear();
  //       }
  //       setUuids2(new Set(newSet)); // uuids2를 uuidSet2와 동기화
  //       return newSet;
  //     });
  //   }, 10*1000); // 5초마다 변경
  
  //   return () => clearInterval(intervalId); // Cleanup interval on unmount
  // }, [desiredCount]);




  useBackground(isScanning);

  useEffect(() => {
    if (!isScanning) {
      handleBLEButton();
    }

    if (isScanning) {
      ScanNearbyAndPost(deviceUUID);
    }

    let timerId: NodeJS.Timeout | null = null;
    if (isBlocked) {
      const restBlockedTime = sendDelayedTime - (Date.now() - blockedTime);
      if (restBlockedTime > 0) {
        setIsBlocked(true);
        setRemainingTime(Math.round(restBlockedTime / 1000));
        timerId = setInterval(() => {
          setRemainingTime((prevTime) => {
            if (prevTime > 0)
              return prevTime - 1;
            setIsBlocked(false);
            clearInterval(timerId);
            return 30;
          });
        }, 1000);
      } else {
        setIsBlocked(false);
      }
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [])

  const updateRssi = (uuid: string, rssi: number) => {
    setRssiMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(uuid, rssi);
      return newMap;
    });
  };

  const handleSetIsNearby = (uuid: string, rssi: number, isBlocked = false) => {
    if (isRssiTracking)
      updateRssi(uuid, rssi);

    if (isBlocked) {
      if (uuidSet.current.size > 0) {
        uuidSet.current.clear();
        uuidTime.current.clear();
        for (const timeoutId of Object.values(uuidTimeoutID)) {
          clearTimeout(timeoutId);
        }
        uuidTimeoutID.current.clear();
      }
      return;
    }

    if (!uuidSet.current.has(uuid)) {
      uuidSet.current.add(uuid);
      uuidTime[uuid] = 0
    } else if (uuidTimeoutID[uuid]) {
      clearTimeout(uuidTimeoutID[uuid]);
      uuidTime[uuid] += 1;
      uuidTime[uuid] = 5 >= uuidTime[uuid] ? uuidTime[uuid] : 5;
    }
    const scanTime = scanDelayedTime + (uuidTime[uuid]) * 1000;
    uuidTimeoutID[uuid] = setTimeout(() => {
      uuidSet.current.delete(uuid);
      uuidTime[uuid] = 0;
      if (isRssiTracking) {
        setRssiMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(uuid);
          return newMap;
        });
      }
      setUuids(new Set(uuidSet.current));
    }, scanTime);
    setUuids(new Set(uuidSet.current));
  };

  useEffect(() => {
    const RSSIvalue = userMMKVStorage.getNumber("bluetooth.rssivalue");
    const { BLEAdvertiser } = NativeModules;
    const eventEmitter = new NativeEventEmitter(BLEAdvertiser);
    eventEmitter.removeAllListeners('onDeviceFound');
    eventEmitter.addListener('onDeviceFound', (event: BleScanInfo) => {
      const now = new Date().getTime();
      for (let i = 0; i < event.serviceUuids.length; i++) {
        const serviceUuid = event.serviceUuids[i];

        if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
          let rssi = event.rssi;
          if (isRssiTracking) {
            let kf = kFileters[event.serviceUuids[i]];
            if (!kf) {
              kFileters[event.serviceUuids[i]] = new KalmanFilter();
              kf = kFileters[event.serviceUuids[i]];
            }
            rssi = kf.filter(event.rssi);
            if (rssi < RSSIvalue) continue;
          }
          if (lastProcessed[serviceUuid] && (now - lastProcessed[serviceUuid]) < 1500) {
            continue;
          }
          lastProcessed[serviceUuid] = now;
          handleSetIsNearby(event.serviceUuids[i], rssi, isBlocked);
          if (lastDeviceAddProcessed[serviceUuid] && (now - lastDeviceAddProcessed[serviceUuid]) < DeviceAddDelayedTime) {
            continue;
          }
          lastDeviceAddProcessed[serviceUuid] = now;
          addDevice(event.serviceUuids[i], new Date().getTime());
        }
      }
    });

    return (()=> {
      eventEmitter.removeAllListeners('onDeviceFound');
      eventEmitter.addListener('onDeviceFound', (event: BleScanInfo) => {
        const now = new Date().getTime();
        for (let i = 0; i < event.serviceUuids.length; i++) {
          const serviceUuid = event.serviceUuids[i];
          if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
            if (backgroundAddProcessed[serviceUuid] && (now - backgroundAddProcessed[serviceUuid]) < DeviceAddDelayedTime) {
              continue;
            }
            backgroundAddProcessed[serviceUuid] = now;
            addDevice(event.serviceUuids[i], new Date().getTime());
          }
        }
      });
    })
  }, [isScanning, isBlocked, isRssiTracking, handleSetIsNearby]);

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
    const success = await handleCheckPermission();
    if (success && !isScanning)
      startScan();
    else if (isScanning) {
      stopScan();
      if (uuidSet.current.size > 0) {
        uuidSet.current.clear();
        uuidTime.current.clear();
        for (const timeoutId of Object.values(uuidTimeoutID)) {
          clearTimeout(timeoutId);
        }
        uuidTimeoutID.current.clear();
      }
    }
  };

  return (
    <>
      {isRssiTracking && (
        <>
          <View style={styles.TVButton} >
            <Button title='    ' onPress={() => setShowTracking(true)} titleStyle={{ color: color.colors.main, fontSize: 20 }} />
          </View>
          <RssiTracking closeModal={() => setShowTracking(false)} modalVisible={showTracking} items={rssiMap} />
        </>
      )}
      <View style={styles.background}>
        <BleButton bleON={isScanning} bleHanddler={handleBLEButton} />
        <AlarmButton notificationId={notificationId} />
        <MessageBox
          uuids={uuidSet.current}
          setRemainingTime={setRemainingTime}
          setShowMsgBox={setShowMsgBox}
          fadeInAndMoveUp={fadeInAndMoveUp}
          visible={showMsgBox}
          onClose={() => setShowMsgBox(false)}
        />
          {!isScanning ? 
            <View style={styles.contentContainer}>
              <DancingText handleBLEButton={handleBLEButton} /> 
            </View> :
            (
              <>
                <BleMainComponent 
                  // uuids={uuids2}
                  uuids={uuids}
                  setShowMsgBox={setShowMsgBox}
                />
                {isBlocked ?
                <BleBottomComponent
                  fadeAnim={fadeAnim}
                  translateY={translateY}
                  remainingTime={remainingTime}
                  showMsgBox={showMsgBox}
                />  : uuidSet.current.size > 0 ? (
                  <View style={styles.bleBottomSubContainer}>
                    <Text style={styles.findTextSmall}>주위 {uuidSet.current.size}명의 인연을 찾았습니다!</Text>
                    <MessageGif setShowMsgBox={setShowMsgBox} />
                  </View>
                ) : (
                  <View style={styles.bleBottomSubContainer}>
                    <Text style={styles.findText}>주위의 인연을 찾고 있습니다.</Text>
                  </View>
                )}
              </>
          )}
      </View>
    </>
  );
};

export default BluetoothScreen;
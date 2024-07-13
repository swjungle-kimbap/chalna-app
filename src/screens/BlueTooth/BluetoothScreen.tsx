import { SafeAreaView, Animated, Modal, NativeEventEmitter, NativeModules, StyleSheet, TouchableWithoutFeedback, View, Image, Keyboard, Dimensions } from "react-native";
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
import DancingWords from "../../components/Bluetooth/DancingWords";
import useFadeText from "../../hooks/useFadeText";
import BleMainComponent from "../../components/Bluetooth/BleMainComponent";
import BleBottomComponent from "../../components/Bluetooth/BleBottomComponent";
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

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

const uuidSet = new Set<string>();
const uuidTime = new Map();
const uuidTimeoutID = new Map();
const kFileters = new Map();
const scanDelayedTime = 10 * 1000;
const sendDelayedTime = 30 * 1000;

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
  const msgSendCnt = useRecoilValue(MsgSendCntState);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showMsgBox, setShowMsgBox] = useState(false);
  const [fadeInAndMoveUp, fadeAnim, translateY] = useFadeText();
  const [uuids, setUuids] = useState<Set<string>>(new Set());

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
  //   }, 5*1000); // 5초마다 변경
  
  //   return () => clearInterval(intervalId); // Cleanup interval on unmount
  // }, [desiredCount]);


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // cleanup function
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    const currentTime = new Date().getTime();
    if (isRssiTracking)
      updateRssi(uuid, rssi);

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
      uuidSet.delete(uuid);
      if (isRssiTracking) {
        setRssiMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(uuid);
          return newMap;
        });
      }
      setUuids(new Set(uuidSet));
    }, scanDelayedTime);
    setUuids(new Set(uuidSet));
  };

  useEffect(() => {
    const RSSIvalue = userMMKVStorage.getNumber("bluetooth.rssivalue");
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
            const filterdRSSI = kf.filter(event.rssi);
            if (filterdRSSI < RSSIvalue) return;
            handleSetIsNearby(event.serviceUuids[i], filterdRSSI, isBlocked);
          } else {
            handleSetIsNearby(event.serviceUuids[i], event.rssi, isBlocked);
          }
          addDevice(event.serviceUuids[i], new Date().getTime());
        }
      }
    });
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
    await handleCheckPermission()
    if (!isScanning)
      startScan();
    else if (isScanning) {
      stopScan();
      if (uuidSet.size > 0) {
        uuidSet.clear();
        uuidTime.clear();
        for (const timeoutId of Object.values(uuidTimeoutID)) {
          clearTimeout(timeoutId);
        }
        uuidTimeoutID.clear();
      }
    }
  };

  return (
    <>
      {isRssiTracking && (
        <>
          <View style={styles.TVButton}>
            <Button title='CCTV' onPress={() => setShowTracking(true)} titleStyle={{ color: 'white', fontSize: 10 }} />
          </View>
          <RssiTracking closeModal={() => setShowTracking(false)} modalVisible={showTracking} items={rssiMap} />
        </>
      )}
      <View style={styles.background}>
        <BleButton bleON={isScanning} bleHanddler={handleBLEButton} />
        <AlarmButton notificationId={notificationId} />
        <View style={styles.contentContainer}>
          {!isScanning ? <DancingText handleBLEButton={handleBLEButton} /> :
            (
              <>
                <BleMainComponent 
                  isKeyboardVisible={isKeyboardVisible}
                  //uuids={uuids2}
                  uuids={uuids}
                />
                <BleBottomComponent
                  isBlocked={isBlocked}
                  fadeAnim={fadeAnim}
                  translateY={translateY}
                  msgSendCnt={msgSendCnt}
                  remainingTime={remainingTime}
                  showMsgBox={showMsgBox}
                  //uuidSet={uuidSet2}
                  uuidSet={uuidSet}
                  setRemainingTime={setRemainingTime}
                  setShowMsgBox={setShowMsgBox}
                  fadeInAndMoveUp={fadeInAndMoveUp}
                />
              </>
            )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#ABD4D4",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between', // 상하 배치
    alignItems: 'center',
    paddingBottom: 30,
  },
  TVButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
    left: 80,
    height: 40,
    width: 40,
    borderRadius: 20,
    paddingVertical: 2, // 상하 여백 설정
    paddingHorizontal: 3, // 좌우 여백 설정
    zIndex: 3
  }
});
export default BluetoothScreen;

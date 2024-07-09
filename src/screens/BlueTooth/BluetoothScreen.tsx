import { Animated, Modal, NativeEventEmitter, NativeModules, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
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
import RoundBox from "../../components/common/RoundBox";
import useBackground from "../../hooks/useBackground";
import { addDevice } from "../../service/Background";
import KalmanFilter from 'kalmanjs'
import RssiTracking from "../../components/Bluetooth/RssiTracking";
import Button from '../../components/common/Button';
import DancingText from "../../components/Bluetooth/DancingText";
import DancingWords from "../../components/Bluetooth/DancingWords";
import useFadeText from "../../hooks/useFadeText";

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
const sendDelayedTime = 30 * 1000;

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

const BluetoothScreen: React.FC<BluetoothScreenPrams> = ({ route }) => {
  const { notificationId = "" } = route.params ?? {};
  const [showMsgBox, setShowMsgBox] = useState(false);
  const isRssiTracking = useRecoilValue(isRssiTrackingState);
  const deviceUUID = useRecoilValue(DeviceUUIDState);
  const [isScanning, setIsScanning] = useMMKVBoolean("map.isScanning", userMMKVStorage);
  const [isBlocked, setIsBlocked] = useMMKVBoolean("map.isBlocked", userMMKVStorage);
  const [blockedTime, setBlockedTime] = useMMKVNumber("map.blockedTime", userMMKVStorage);
  const [showTracking, setShowTracking] = useState(false);
  const [rssiMap, setRssiMap] = useState<Map<string, number>>(null);
  const [detectCnt, setDetectCnt] = useState(0);
  const [remainingTime, setRemainingTime] = useState(30);
  const msgSendCnt = useRecoilValue(MsgSendCntState);
  
  const [fadeInAndMoveUp, fadeAnim, translateY] = useFadeText();
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

  const handleSetIsNearby = (uuid: string, rssi:number, isBlocked = false) => {
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
        setDetectCnt(0);
      }
      return;
    }

    if (!uuidSet.has(uuid)) {
      uuidSet.add(uuid);
      setDetectCnt(prev => prev+1);
    } else {
      if (uuidTimeoutID[uuid]) {
        clearTimeout(uuidTimeoutID[uuid]);
      }
    }
    uuidTime[uuid] = currentTime;
    uuidTimeoutID[uuid] = setTimeout(() => {
      uuidSet.delete(uuid)
      setDetectCnt(prev => {
        if (prev > 0)
          return prev-1
        else 
          return 0;
        });
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
      if (uuidSet.size > 0) {
        uuidSet.clear();
        uuidTime.clear();
        for (const timeoutId of Object.values(uuidTimeoutID)) {
          clearTimeout(timeoutId);
        }
        uuidTimeoutID.clear();
        setDetectCnt(0);
      }
    }
  };

  return (
    <>
      {isRssiTracking && (
        <>
          <View style={styles.TVButton}>
            <Button title='CCTV' onPress={()=>setShowTracking(true)} titleStyle={{color: 'white' , fontSize: 10}}/>
          </View>
          <RssiTracking closeModal={()=>setShowTracking(false)} modalVisible = {showTracking} items={rssiMap}/>
        </>
      )} 
      <View style={styles.background}>
        <BleButton bleON={isScanning} bleHanddler={handleBLEButton} />
        <AlarmButton notificationId={notificationId} />
        <View style={styles.contentContainer}>
          {isScanning ? <Text style={styles.findText}>10m 이내에 인연을 찾고 있습니다</Text> :
            <Text style={styles.findText}>주변의 사람을 찾을 수 없습니다.</Text>
          }
          <RoundBox style={styles.content}>
            <Text>디자인</Text>
          </RoundBox>
          <View style={styles.msgContent}>
          {showMsgBox ?
          <Modal
            animationType="slide"
            transparent={true}
            visible={showMsgBox}
            onRequestClose={()=>{setShowMsgBox(false)}}
          >
            <TouchableWithoutFeedback onPress={()=>{setShowMsgBox(false)}}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <MessageBox uuids={uuidSet} setShowMsgBox={setShowMsgBox} setRemainingTime={setRemainingTime}
                      fadeInAndMoveUp={fadeInAndMoveUp}/>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal> : (
           isBlocked ?  
            <>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: translateY }],
              }}>
              <Text variant='sub'style={{fontSize: 15}}>{msgSendCnt ? `${msgSendCnt}명에게 인연 메세지를 보냈습니다.` :
                "메세지를 보낼 수 없는 대상입니다. 다시 보내 주세요!"}</Text>
            </Animated.View>
            <Text style={styles.blockText}>인연 메세지는</Text>
            <Text style={styles.blockText2}>{remainingTime}초 뒤에 다시 보낼 수 있습니다.</Text>
            </> : 
            isScanning ? detectCnt ?  
            <>
              <Text style={styles.findText}>주위의 {detectCnt}명의 인연을 만났습니다!</Text>
              <DancingText setShowMsgBox = {setShowMsgBox}/>                
            </> : 
            <>
            <DancingWords/>
            </> : (
              <Text style={styles.findText}>블루투스 버튼을 눌러 주세요!</Text>
          ))}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  blockText2: {
    marginTop: 10,
    fontSize: 20,
  },
  blockText: {
    marginTop: 40,
    fontSize: 20,
  },
  msgContent: {
    height: 100,
  },
  modalContent: {
    position: 'absolute',
    width: '95%',
    bottom: 80, 
    right: 5,
  },
  modalOverlay: {
    flex: 1,
  },
  sendButton: {
    padding: 12,
    borderTopWidth: 4,
    borderColor: '#14F12A'
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
    zIndex:3
  },
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
    fontSize: 17,
    color: 'blue',
    textAlign: 'center',
  },
});

export default BluetoothScreen;
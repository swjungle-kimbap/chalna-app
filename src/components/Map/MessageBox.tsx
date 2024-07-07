import  React, { useState, useEffect, useRef } from 'react';
import RoundBox from '../common/RoundBox';
import Button from '../common/Button';
import { StyleSheet, TextInput, View, Alert, NativeModules, NativeEventEmitter, Animated, LogBox } from 'react-native';
import Text from '../common/Text';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DeviceUUIDState, isRssiTrackingState, showMsgBoxState } from '../../recoil/atoms';
import ScanNearbyAndPost, { ScanNearbyStop } from '../../service/Bluetooth';
import showPermissionAlert from '../../utils/showPermissionAlert';
import requestPermissions from '../../utils/requestPermissions';
import requestBluetooth from '../../utils/requestBluetooth';
import { PERMISSIONS } from 'react-native-permissions';
import { isNearbyState } from "../../recoil/atoms";
import { AxiosResponse, SendMatchResponse, SendMsgRequest } from '../../interfaces';
import { axiosPost } from '../../axios/axios.method';
import BleButton from './BleButton';
import { urls } from '../../axios/config';
import useBackground from '../../hooks/useBackground';
import {  userMMKVStorage } from '../../utils/mmkvStorage';
import RssiTracking from './RssiTracking';
import { useMMKVBoolean, useMMKVNumber, useMMKVString } from 'react-native-mmkv';
import { addDevice } from '../../service/Background';
import KalmanFilter from 'kalmanjs'

const ignorePatterns = [
  /No task registered for key shortService\d+/,
];

// 패턴에 맞는 로그 메시지를 무시
ignorePatterns.forEach(pattern => {
  LogBox.ignoreLogs([pattern.source]);
});
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

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

const uuidSet = new Set<string>(); 
const uuidTime = new Map(); 
const uuidTimeoutID = new Map();
const kFileters = new Map();
const scanDelayedTime = 5 * 1000;
const sendDelayedTime = 60 * 1000;

const MessageBox: React.FC = ()  => {
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const [nearInfo, setNearInfo] = useRecoilState(isNearbyState);
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

  useBackground(isScanning);
  
  useEffect(()=> {
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
  }, []);

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

    setNearInfo({isNearby: true, lastMeetTime: currentTime});
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      setNearInfo(prevNearInfo => ({
        ...prevNearInfo,
        isNearby: false
      }));
    }, scanDelayedTime)

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
      setNearInfo(prevNearInfo => ({
        ...prevNearInfo,
        isNearby: false
      }));
    }
  };
  
  const sendMsg = async ( uuids:Set<string>) => {
    const response = await axiosPost<AxiosResponse<SendMatchResponse>>(urls.SEND_MSG_URL, "인연 보내기", {
      deviceIdList: Array.from(uuids),
      message: msgText,
    } as SendMsgRequest)
    sendCountsRef.current = response.data.data.sendCount;
  }  

  const handleSendingMessage = async () => {
    const checkValid = await checkvalidInput();
    if (!checkValid) {
      return ;
    } else if (!isScanning) {
      Alert.alert('주위 인연을 만날 수 없습니다.', '블루투스 버튼을 켜고 새로운 인연을 만나기 전까지 기다려주세요!',
        [
          {
            text: '켜기',
            onPress: async () => {await handleBLEButton()},
            style: 'default'
          },
        ],
        {cancelable: true,},
      );
    } else if (isBlocked) {
      Alert.alert('잠시 기다려 주세요', '인연 메세지는 1분에 1번씩 보낼 수 있어요!');
    } else if (!nearInfo.isNearby || !uuidSet) {
      Alert.alert('주위 인연이 없습니다.', '새로운 인연을 만나기 전까지 기다려주세요!');
    } else {
      await sendMsg(uuidSet);

      setIsBlocked(true);
      setBlockedTime(Date.now());
      setTimeout(() => {
        setIsBlocked(false);
      }, sendDelayedTime);
      fadeInAndMoveUp();
      setShowMsgBox(false);
    }
  }

  const checkvalidInput = () => {
    if (!isScanning && msgText.length < 5) {
      Alert.alert('내용을 더 채워 주세요', '5글자 이상 입력해 주세요!');
      return false;
    } else {
      return true;
    }
  };

  const fadeInAndMoveUp = () => {
    fadeAnim.setValue(0);
    translateY.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      fadeOutAndMoveUp();
    });
  };

  const fadeOutAndMoveUp = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 3000,
        useNativeDriver: true,
      })
    ]).start();
  };

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
      <BleButton bleON = {isScanning} bleHanddler = {handleBLEButton}/>
      <Animated.View
        style={[
          styles.msgcontainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: translateY }],
          }
        ]}
      >
        <Text variant='sub'>{sendCountsRef.current}명에게 인연 메세지를 보냈습니다.</Text>
      </Animated.View>
      {showMsgBox ? (
          <View style={styles.msgcontainer} >
            <RoundBox width='95%' 
              style={[styles.msgBox, {borderColor : nearInfo.isNearby && !isBlocked && isScanning ? '#14F12A': '#979797'}]}>
              <View style={styles.titleContainer}>
                <Text variant='title' style={styles.title}>인연 메세지 <Button title='💬' onPress={() => {
                  Alert.alert("인연 메세지 작성",`${sendDelayedTime/(60 * 1000)}분에 한번씩 주위의 인연들에게 메세지를 보낼 수 있어요! 메세지를 받기 위해 블루투스 버튼을 켜주세요`)}
                }/> </Text>
              </View>
              <TextInput value={msgText} style={[styles.textInput, { color: '#333' }]}
                  onChange={(event) => {setMsgText(event.nativeEvent.text);}}
                  />
              <Button title={'보내기'} variant='main' titleStyle={{color: isScanning ? '#000': '#979797'}}
                onPress={() => handleSendingMessage()}/>
            </RoundBox>
          </View>
      ) : (
        <RoundBox width='95%' 
          style={[styles.buttonContainer, {borderColor : nearInfo.isNearby && !isBlocked && isScanning ? '#14F12A': '#979797'}]}>
          <Button title='인연 보내기' onPress={() => setShowMsgBox(true)}/>
        </RoundBox>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 요소 간격 최대화
    width: '100%', // 컨테이너 너비를 꽉 채움
    marginBottom: 10,
  },
  msgcontainer: {
    position: 'absolute',
    width: '95%',
    bottom: 10, 
    right: 5,
    zIndex: 2,
  },
  msgBox: {
    width: '95%',
    paddingTop: 0,
    padding: 20,
    borderTopWidth: 4,
  },
  title: {
    paddingTop: 15,
    fontSize: 18,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderColor: '#000',
    color: '#FFF',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    width: '75%',
    position: 'absolute',
    bottom: 10, 
    right: 10,
    zIndex: 2,
    borderTopWidth: 2,
  }
});

export default MessageBox;
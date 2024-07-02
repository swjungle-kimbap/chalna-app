import  { useState, useEffect, useRef, useCallback } from 'react';
import RoundBox from '../common/RoundBox';
import Button from '../common/Button';
import { StyleSheet, TextInput, View, Alert, NativeModules, NativeEventEmitter, Animated, AppStateStatus, AppState } from 'react-native';
import Text from '../common/Text';
import { getAsyncObject } from "../../utils/asyncStorage";
import useBackgroundSave from '../../hooks/useChangeBackgroundSave';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DeviceUUIDState, showMsgBoxState } from '../../recoil/atoms';
import ScanNearbyAndPost, { addDevice, ScanNearbyStop } from '../../service/Bluetooth';
import showPermissionAlert from '../../utils/showPermissionAlert';
import requestPermissions from '../../utils/requestPermissions';
import requestBluetooth from '../../utils/requestBluetooth';
import { PERMISSIONS } from 'react-native-permissions';
import { isNearbyState } from "../../recoil/atoms";
import { SavedMessageData, SendMsgRequest } from '../../interfaces';
import { axiosPost } from '../../axios/axios.method';
import BleButton from './BleButton';
import { urls } from '../../axios/config';
import useBackground from '../../hooks/useBackground';
import { useFocusEffect } from '@react-navigation/core';

const tags = ['상담', '질문', '대화', '만남'];

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

const uuidSet = new Set(); 
const uuidTime = new Map(); 
const uuidTimeoutID = new Map();  

const scanDelayedTime = 5 * 1000;
const sendDelyaedTime = 60 * 1000;

const MessageBox: React.FC = ()  => {
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const [msgText, setMsgText] = useState('안녕하세요!');
  const [selectedTag, setSelectedTag] = useState<string>(''); 
  const [nearInfo, setNearInfo] = useRecoilState(isNearbyState);
  const [isScanning, setIsScanning] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const deviceUUID = useRecoilValue(DeviceUUIDState);
  const msgTextRef = useRef(msgText);
  const blockedTimeRef = useRef<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const sendCountsRef = useRef(0);

  const fetchSavedData = async () => {
    const savedData = await getAsyncObject<SavedMessageData>("savedMessageData");
    console.log(savedData, "in messagebox");
    if (savedData?.msgText) setMsgText(savedData.msgText);
    if (savedData?.selectedTag) setSelectedTag(savedData.selectedTag);
    if (savedData?.isScanning) {
      setIsScanning(true);
      ScanNearbyAndPost(deviceUUID, handleSetIsNearby);
    }
    if (savedData?.isBlocked) {
      const restBlockedTime = sendDelyaedTime - (Date.now() - savedData.blockedTime);
      if (restBlockedTime > 0) {
        setIsBlocked(true);
        timeoutIdRef.current = setTimeout(() => setIsBlocked(false), restBlockedTime);
      }
    }
  };
  
  useEffect(()=> {
    fetchSavedData();
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        fetchSavedData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [fetchSavedData]);

  const handleSetIsNearby = (uuid:string, isBlocked = false) => {
    const currentTime = new Date().getTime();
    
    if (nearInfo.lastMeetTime + scanDelayedTime - 1000 < currentTime) {
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

    // 마지막 1초 남았을 때만 update
    if (!uuidSet.has(uuid)) {
      uuidSet.add(uuid);
    } else if (uuidTime[uuid] + scanDelayedTime - 1000 > currentTime){
      return;
    } else {
      if (uuidTimeoutID[uuid]) {
        clearTimeout(uuidTimeoutID[uuid]);
      }
    }
    uuidTime[uuid] = currentTime;
    uuidTimeoutID[uuid] = setTimeout(() => {
      uuidSet.delete(uuid)
    }, scanDelayedTime)
  };

  useEffect(() => {
    const { BLEAdvertiser } = NativeModules;
    const eventEmitter = new NativeEventEmitter(BLEAdvertiser);
    eventEmitter.removeAllListeners('onDeviceFound');
    eventEmitter.addListener('onDeviceFound', async (event) => {
      if (event.serviceUuids) {
        for (let i = 0; i < event.serviceUuids.length; i++) {
          if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
            handleSetIsNearby(event.serviceUuids[i], isBlocked);
            addDevice(event.serviceUuids[i], new Date().getTime());
          }
        }
      }
    });
  }, [isBlocked])

  const startScan = async () => {
    if (!isScanning) {
      ScanNearbyAndPost(deviceUUID, handleSetIsNearby);
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
  
  const sendMsg = async ( _uuid:string) => {
    await axiosPost(urls.SEND_MSG_URL, "인연 보내기", {
      receiverDeviceId: _uuid,
      message: msgText,
      interestTag:[selectedTag]
    } as SendMsgRequest)
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
      sendCountsRef.current = uuidSet.size;
      uuidSet.forEach((uuid:string) => {
        sendMsg(uuid);
      })
      setIsBlocked(true);
      blockedTimeRef.current = Date.now();
      setTimeout(() => {
        setIsBlocked(false);
      }, sendDelyaedTime);
      fadeInAndMoveUp();
      setShowMsgBox(false);
    }
  }


  const handleTagPress = (tag: string) => {
    setSelectedTag(prevTag => {
      if (prevTag === tag)
        return '';
      return tag 
    }); 
  };

  const checkvalidInput = () => {
    if (!isScanning && msgTextRef.current.length < 5) {
      Alert.alert('내용을 더 채워 주세요', '5글자 이상 입력해 주세요!');
      return false;
    } else {
      return true;
    }
  };

  useBackground({
    msgText,
    selectedTag,
    isScanning,
    isBlocked,
    blockedTime : blockedTimeRef.current
  });

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
                  Alert.alert("인연 메세지 작성",`${sendDelyaedTime/(60 * 1000)}분에 한번씩 주위의 인연들에게 메세지를 보낼 수 있어요! 메세지를 받기 위해 블루투스 버튼을 켜주세요`)}
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
  tagText:{
    paddingTop: 15,
  },
  selectedTag: {
    color: '#000', 
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
  tagcontainer: {
    position: 'absolute',
    width: '95%',
    bottom: 280, 
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
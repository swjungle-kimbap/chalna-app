import  { useState, useEffect, useRef } from 'react';
import RoundBox from '../common/RoundBox';
import Button from '../common/Button';
import { StyleSheet, TextInput, View, Alert, NativeModules, NativeEventEmitter } from 'react-native';
import Text from '../common/Text';
import { getAsyncObject, getAsyncString, setAsyncString } from "../../utils/asyncStorage";
import useBackgroundSave from '../../hooks/useChangeBackgroundSave';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DeviceUUIDState, showMsgBoxState } from '../../recoil/atoms';
import ScanNearbyAndPost, { addDevice, ScanNearbyStop } from '../../service/Bluetooth';
import { getKeychain } from '../../utils/keychain';
import showPermissionAlert from '../../utils/showPermissionAlert';
import requestPermissions from '../../utils/requestPermissions';
import requestBluetooth from '../../utils/requestBluetooth';
import { PERMISSIONS } from 'react-native-permissions';
import { isNearbyState } from "../../recoil/atoms";
import { SendMsgRequest } from '../../interfaces';
import { axiosPost } from '../../axios/axios.method';
import Config from 'react-native-config';
import BleButton from './BleButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedMessageData {
  msgText: string,
  selectedTag: string,
  isScanning: boolean,
  isBlocked: boolean,
  blockedTime: number,
}

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
  
  useEffect(() => {
    const fetchSavedData = async () => {
      const savedData = await getAsyncObject<SavedMessageData>("savedMessageData");
      setMsgText(savedData.msgText);
      setSelectedTag(savedData.selectedTag);
      if (savedData.isScanning){
        setIsScanning(true);
        ScanNearbyAndPost(deviceUUID);
      }

      if (savedData.isBlocked){
        setIsBlocked(true);
        const restBlockedTime = sendDelyaedTime - (Date.now() - savedData.blockedTime);
        setTimeout(() => setIsBlocked(false), restBlockedTime)
      }
    };
    fetchSavedData();

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const handleSetIsNearby = (uuid:string, isBlocked = false) => {
    console.log('uuidSet', uuidSet);
    const currentTime = new Date().getTime();
    uuidTime[uuid] = currentTime;
    
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
      console.log('clear after blocked', isBlocked);
      if (uuidSet.size > 0) {
        console.log('clearing');
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
      console.log("add")
      uuidSet.add(uuid);
      uuidTime[uuid] = currentTime;
    } else if (uuidTime[uuid] + scanDelayedTime - 1000 < currentTime) {
      if (uuidTimeoutID[uuid]) {
        console.log("clear")
        clearTimeout(uuidTimeoutID[uuid]);
      }
      console.log("set")
      uuidTimeoutID[uuid] = setTimeout(() => {
        uuidSet.delete(uuid)
      }, scanDelayedTime)
    }
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
    console.log("msg send!")
    await axiosPost(Config.SEND_MSG_URL, "인연 보내기", {
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
      uuidSet.forEach((uuid:string) => {
        sendMsg(uuid);
      })
      console.log("blocked");
      setIsBlocked(true);
      blockedTimeRef.current = Date.now();
      setTimeout(() => {
        setIsBlocked(false);
      }, sendDelyaedTime);
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

  useBackgroundSave<SavedMessageData>('savedMessageData', {
    msgText,
    selectedTag,
    isScanning,
    isBlocked,
    blockedTime : blockedTimeRef.current
  });
  return (
    <>
      <BleButton bleON = {isScanning} bleHanddler = {handleBLEButton}/>
      {showMsgBox ? (
          <View style={styles.msgcontainer} >
            <RoundBox width='95%' 
              style={[styles.msgBox, {borderColor : nearInfo.isNearby && !isBlocked && isScanning ? '#14F12A': '#979797'}]}>
              <View style={styles.titleContainer}>
                <Text variant='title' style={styles.title}>메세지</Text>
                  {tags.map((tag) => (
                    <Button titleStyle={[styles.tagText, selectedTag === tag && styles.selectedTag]} 
                      variant='sub' title={`#${tag}`}  onPress={() => handleTagPress(tag)} 
                      key={tag} activeOpacity={0.6} />
                  ))}
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
  closebutton: {
    width:15,
    height:15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 요소 간격 최대화
    width: '100%', // 컨테이너 너비를 꽉 채움
    marginBottom: 10,
  },
  sendButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    width: '100%', 
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
  tagContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    width: '100%', 
    marginBottom: 10,
  },
  MsgContainer: {
    width: '95%',
    position: 'absolute',
    bottom: 65, 
    right: 5,
    zIndex: 2,
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
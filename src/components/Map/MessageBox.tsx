import  { useState, useEffect, useRef } from 'react';
import RoundBox from '../common/RoundBox';
import Button from '../common/Button';
import { StyleSheet, TextInput, View, Alert } from 'react-native';
import Text from '../common/Text';
import { getAsyncString, setAsyncString } from "../../utils/asyncStorage";
import useBackgroundSave from '../../hooks/useChangeBackgroundSave';
import { useRecoilState } from 'recoil';
import { showMsgBoxState } from '../../recoil/atoms';
import ScanNearbyAndPost, { ScanNearbyStop } from '../../service/ScanNearbyAndPost';
import { getKeychain } from '../../utils/keychain';
import { EmitterSubscription } from 'react-native';
import showPermissionAlert from '../../utils/showPermissionAlert';
import requestPermissions from '../../utils/requestPermissions';
import requestBluetooth from '../../utils/requestBluetooth';
import { PERMISSIONS } from 'react-native-permissions';
import { isNearbyState } from "../../recoil/atoms";

const tags = ['상담', '질문', '대화', '만남'];

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

const MessageBox: React.FC = ()  => {
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const [msgText, setMsgText] = useState('안녕하세요!');
  const [selectedTag, setSelectedTag] = useState<string>(''); 
  const [nearInfo, setNearInfo] = useRecoilState(isNearbyState);
  const [isScanning, setIsScanning] = useState(false);
  const onDeviceFoundRef = useRef<EmitterSubscription | null>(null);
  const msgTextRef = useRef(msgText);
  const uuidRef = useRef<string>('');

  useEffect(() => {
    const fetchSavedData = async () => {
      const savedmsgText = await getAsyncString('msgText')
      setMsgText(savedmsgText);
      const savedTag = await getAsyncString('tag')
      setSelectedTag(savedTag);

      const uuid = await getKeychain('deviceUUID');
      if (uuid)
        uuidRef.current = uuid;

      const savedIsScanning = await getAsyncString('isScanning');
      if (savedIsScanning === 'true'){
        setIsScanning(true);
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
    if (!isScanning) {
      if (onDeviceFoundRef.current){
        onDeviceFoundRef.current.remove();
        onDeviceFoundRef.current = null;
      }
      const listener = await ScanNearbyAndPost(uuidRef.current, handleSetIsNearby);
      onDeviceFoundRef.current = listener;
      await setAsyncString('isScanning', 'true');
      setIsScanning(true);
    }
  };

  const stopScan = async () => {
    if (isScanning) {
      ScanNearbyStop();
      if (onDeviceFoundRef.current){
        onDeviceFoundRef.current.remove();
        onDeviceFoundRef.current = null;
      }
      await setAsyncString('isScanning', 'false');
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

  const handleTagPress = async (tag: string) => {
    setSelectedTag(prevTag => {
      if (prevTag === tag)
        return '';
      setAsyncString('tag', tag);
      return tag 
    }); 
  };

  const checkvalidInput = () => {
    if (!isScanning && msgTextRef.current.length < 5) {
      Alert.alert('내용을 더 채워 주세요', '5글자 이상 입력해 주세요!');
      return false;
    } else {
      setAsyncString('msgText', msgText);
      return true;
    }
  };

  const handleSendingMessage = async () => {
    await handleCheckPermission()
    const checkValid = await checkvalidInput();
    if (!isScanning || checkValid)
      await startScan();
    else if (isScanning)
      await stopScan();
  };

  useEffect(()=> {
    setAsyncString('msgText', msgText);
  }, [showMsgBox])

  useBackgroundSave<string>('msgText', msgTextRef, msgText);
  return (
    <>
      {showMsgBox ? (
          <View style={styles.msgcontainer} >
            <RoundBox width='95%' style={[styles.msgBox, {borderColor : isScanning ? '#14F12A': '#979797'}]}>
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
              <Button title={isScanning ? '멈추기' : '보내기'} variant='main' 
                onPress={handleSendingMessage}/>
            </RoundBox>
          </View>
      ) : (
        <RoundBox width='95%' style={[styles.buttonContainer, {borderColor : isScanning ? '#14F12A': '#979797'}]}>
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
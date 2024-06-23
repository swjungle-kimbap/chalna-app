import React, { useState, useEffect, useRef } from 'react';
import ScanNearbyAndPost, { ScanNearbyStop } from '../../service/ScanNearbyAndPost';
import { getKeychain } from '../../utils/keychain';
import RoundBox from '../common/RoundBox';
import Button from '../../components/common/Button';
import { StyleSheet, TextInput, View } from 'react-native';
import { EmitterSubscription } from 'react-native';
import Text from '../common/Text';
import { getAsyncString, setAsyncString } from "../../utils/asyncStorage";
import showPermissionAlert from '../../utils/showPermissionAlert';
import requestPermissions from '../../utils/requestPermissions';
import requestBluetooth from '../../utils/requestBluetooth';
import useBackgroundSave from '../../hooks/useChangeBackgroundSave';

const tags = ['상담', '질문', '대화'];

interface ScanButtonProps {
  disable: boolean;
}

const ScanButton: React.FC<ScanButtonProps> = ({ disable })  => {
  const [onDeviceFound, setOnDeviceFound] = useState<EmitterSubscription | null>(null);
  const [showMsgBox, setShowMsgBox] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceUUID, setDeviceUUID] = useState<string>('');
  const [msgText, setMsgText] = useState('안녕하세요!');
  const [selectedTag, setSelectedTag] = useState<string>(''); 
  const msgTextRef = useRef(msgText);

  useEffect(() => {
    const fetchSavedData = async () => {
      const uuid = await getKeychain('deviceUUID');
      if (uuid)
        setDeviceUUID(uuid);
      const savedIsScanning = await getAsyncString('isScanning');
      if (savedIsScanning === 'true')
        setIsScanning(true);
      const savedmsgText = await getAsyncString('msgText')
      setMsgText(savedmsgText);
      const savedTag = await getAsyncString('tag')
      setSelectedTag(savedTag);
    };
    fetchSavedData();
  }, []);

  const startScan = async () => {
    if (!isScanning) {
      if (onDeviceFound) {
        onDeviceFound.remove();
        setOnDeviceFound(null);
      }
      const listener = await ScanNearbyAndPost(deviceUUID);
      setOnDeviceFound(listener);
      await setAsyncString('isScanning', 'true');
      setIsScanning(true);
    }
  };

  const stopScan = async () => {
    if (isScanning) {
      ScanNearbyStop();
      if (onDeviceFound){
        onDeviceFound.remove();
        setOnDeviceFound(null);
      }
      await setAsyncString('isScanning', 'false');
      setIsScanning(false);
    }
  };

  const handleCheckPermission = async () => {
    requestBluetooth().then(async (checkNotBluetooth) => {
      if (disable || !checkNotBluetooth) {
        await showPermissionAlert();
        const granted = await requestPermissions();
        if (granted)
          disable = false;
      } else {
        setShowMsgBox(true);
      }
    });
  };

  const handleTagPress = async (tag: string) => {
    setSelectedTag(prevTag => {
      if (prevTag === tag)
        return '';
      setAsyncString('tag', tag);
      return tag 
    }); 
    
  };
  useBackgroundSave<string>('msgText', msgTextRef, msgText);
  return (
    <>
      {showMsgBox ? (
        <>
          <View style={styles.msgcontainer} >
            <RoundBox width='95%' style={[styles.msgBox, {borderColor : isScanning ? '#14F12A': '#2344F0'}]}>
              <View style={styles.titleContainer}>
                <Text variant='title' style={styles.title}>메세지</Text>
                  {tags.map((tag) => (
                    <Button titleStyle={[styles.tagText, selectedTag === tag && styles.selectedTag]} 
                      variant='sub' title={`#${tag}`}  onPress={() => handleTagPress(tag)} 
                      key={tag} activeOpacity={0.6} />
                  ))}
                <Button iconSource={require('../../assets/buttons/CloseButton.png')}
                  imageStyle={styles.closebutton} 
                  onPress={() => {setShowMsgBox(false); setAsyncString('msgText', msgText);}} />
              </View>
              <TextInput value={msgText} style={[styles.textInput, { color: '#333' }]}
                  onChange={(event) => {setMsgText(event.nativeEvent.text);}}
                  onEndEditing={() => {setAsyncString('msgText', msgText);}}
                  />
              <Button variant='main' title={isScanning ? '멈추기' : '보내기'} 
                  onPress={isScanning ? stopScan : startScan}/>
            </RoundBox>
          </View>
        </>
      ) : (
        <RoundBox width='95%' style={[styles.buttonContainer, {borderColor : isScanning ? '#14F12A': '#2344F0'}]}>
          <Button title='인연 만나기' onPress={handleCheckPermission}/>
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
  msgcontainer: {
    position: 'absolute',
    width: '95%',
    bottom: 65, 
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
    bottom: 65, 
    right: 10,
    zIndex: 2,
    borderTopWidth: 2,
  }
});

export default ScanButton;
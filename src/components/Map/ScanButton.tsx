import React, { useState, useEffect } from 'react';
import ScanNearbyAndPost, { ScanNearbyStop } from '../../service/ScanNearbyAndPost';
import { getKeychain } from '../../utils/keychain';
import RoundBox from '../common/RoundBox';
import Button from '../../components/common/Button';
import { StyleSheet, TextInput, View } from 'react-native';
import { EmitterSubscription } from 'react-native';
import Text from '../common/Text';
import { getAsyncString, setAsyncString } from "../../utils/asyncStorage";

const ScanButton: React.FC = () => {
  const [onDeviceFound, setOnDeviceFound] = useState<EmitterSubscription | null>(null);
  const [showMsgBox, setShowMsgBox] = useState(false);
  const [showTagBox, setShowTagBox] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceUUID, setDeviceUUID] = useState<string>('');

  useEffect(() => {
    const fetchSavedData = async () => {
      const uuid = await getKeychain('deviceUUID');
      if (uuid)
        setDeviceUUID(uuid);

      const isScanningString = await getAsyncString('isScanning');
      if (isScanningString === 'true')
        setIsScanning(true);
    };
    fetchSavedData();
  }, []);


  const startScan = async () => {
    if (!isScanning) {
      const listener = await ScanNearbyAndPost(deviceUUID);
      setOnDeviceFound(listener);
      setIsScanning(true);
      await setAsyncString('isScanning', 'true');
    }
  };

  const stopScan = async () => {
    if (isScanning) {
      if (onDeviceFound)
        onDeviceFound.remove();
      ScanNearbyStop();
      setOnDeviceFound(null);
      setIsScanning(false);
      await setAsyncString('isScanning', 'false');
    }
  };

  return (
    <>
      {showMsgBox ? (
        <>
        {showTagBox ? 
          <View style={styles.tagcontainer}>
            <RoundBox width='95%' style={styles.msgBox}>
              <View style={styles.titleContainer}>
                <Text variant='title' style={styles.title}>태그 추가</Text>
                <Button iconSource={require('../../assets/buttons/CloseButton.png')}
                  onPress={() => setShowTagBox(false)} imageStyle={styles.closebutton} />
              </View>
              <TextInput
                placeholder='내용을 입력하세요'
                style={[styles.textInput, { color: '#333' }]}
              />
            </RoundBox>
          </View>
          : <></>}
          <View style={styles.msgcontainer} >
            <RoundBox width='95%' style={[styles.msgBox, {borderColor : isScanning ? '#14F12A': '#2344F0'}]}>
              <View style={styles.titleContainer}>
                <Text variant='title' style={styles.title}>인연 만나기</Text>
                <Button iconSource={require('../../assets/buttons/CloseButton.png')}
                  onPress={() => setShowMsgBox(false)} imageStyle={styles.closebutton} />
              </View>
              <TextInput
                placeholder='추가할 태그를 입력해주세요'
                style={[styles.textInput, { color: '#333' }]}
              />
              <View style={styles.tagContainer}>
                <RoundBox style={styles.tag}>
                  <Text style={styles.tagText}>#시험</Text>
                </RoundBox>
                <Button title='태그추가'titleStyle={{fontSize: 14}} variant='sub' 
                  onPress={() => setShowTagBox(true)}/>
              </View>
              <Button variant='main' title={isScanning ? '멈추기' : '보내기'} 
                onPress={isScanning ? stopScan : startScan}/>
            </RoundBox>
          </View>
        </>
      ) : (
        <RoundBox width='95%' style={[styles.buttonContainer, {borderColor : isScanning ? '#14F12A': '#2344F0'}]}>
          <Button
            title='인연 만나기'
            onPress={() => setShowMsgBox(true)}/>
        </RoundBox>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
    borderWidth: 2,
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
  tag: {
    padding: 5,
    backgroundColor: '#8E8E93',
    borderRadius: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
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
    borderWidth: 2,
  }
});

export default ScanButton;
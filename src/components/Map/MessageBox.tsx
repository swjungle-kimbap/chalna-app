import  React, { useState, useEffect, useRef } from 'react';
import RoundBox from '../common/RoundBox';
import Button from '../common/Button';
import { StyleSheet, TextInput, View, Alert, NativeModules, NativeEventEmitter, Animated, AppStateStatus, AppState ,  Image, TouchableOpacity, LogBox  } from 'react-native';
import Text from '../common/Text';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DeviceUUIDState, isRssiTrackingState, showMsgBoxState } from '../../recoil/atoms';
import ScanNearbyAndPost, { ScanNearbyStop } from '../../service/Bluetooth';
import showPermissionAlert from '../../utils/showPermissionAlert';
import requestPermissions from '../../utils/requestPermissions';
import requestBluetooth from '../../utils/requestBluetooth';
import { PERMISSIONS } from 'react-native-permissions';
import { isNearbyState } from "../../recoil/atoms";
import { AxiosResponse, SendMatchResponse, SendMsgRequest, FileResponse } from '../../interfaces';
import { axiosPost } from '../../axios/axios.method';
import BleButton from './BleButton';
import { urls } from '../../axios/config';
import useBackground from '../../hooks/useBackground';
import {  userMMKVStorage } from '../../utils/mmkvStorage';
import RssiTracking from './RssiTracking';
import { useMMKVBoolean, useMMKVNumber, useMMKVString } from 'react-native-mmkv';
import { addDevice } from '../../service/Background';
import KalmanFilter from 'kalmanjs'
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import FastImage from 'react-native-fast-image';

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

const tags = ['텍스트', '사진'];

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
  const [selectedTag, setSelectedTag] = useMMKVString("map.selectedTag", userMMKVStorage); 
  const [imageUrl, setImageUrl] = useMMKVString("map.imageUrl", userMMKVStorage); 
  const [fileId, setFileId] = useMMKVNumber("map.fileId", userMMKVStorage); 
  const [selectedImage, setSelectedImage] = useState(null);
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

  const handleSelectImage = () => {
    setFileId(0);
    launchImageLibrary({mediaType: 'photo', includeBase64: false}, (response) => {
      if (response.didCancel) {
          console.log('이미지 선택 취소');
      } else if (response.errorMessage) {
        console.log('error : ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0 ) {
        console.log('이미지 선택 완료')
        setSelectedImage(response.assets[0]);
        setImageUrl(response.assets[0].uri);
      }
    })
  }

  const uploadImageToS3 = async () => {
    console.log('선택된 이미지 :', selectedImage);
    // 유효성 검사 추가하기 
    if(!selectedImage) {
      return null;
    }
    const { uri, fileName, fileSize, type: contentType} = selectedImage;
    
    // 서버로 전송해서 업로드 프리사인드 url 받아오기
    try {
      const metadataResponse = await axiosPost<AxiosResponse<FileResponse>>(`${urls.FILE_UPLOAD_URL}`, "파일 업로드", {
        fileName,
        fileSize,
        contentType
    });
    console.log("서버로 받은 데이터 : ", JSON.stringify(metadataResponse?.data?.data));
    const {fileId, presignedUrl} = metadataResponse?.data?.data;

    // 이미지 리사이징 
    const resizedImage = await ImageResizer.createResizedImage(
      uri,
      1500, // 너비를 500으로 조정
      1500, // 높이를 500으로 조정
      'JPEG', // 이미지 형식
      100, // 품질 (0-100)
      0, // 회전 (회전이 필요하면 EXIF 데이터에 따라 수정 가능)
      null,
      true,
      { onlyScaleDown: true }
  );

    const resizedUri = resizedImage.uri;

    const file = await fetch(resizedUri);
    const blob = await file.blob();
    const uploadResponse = await fetch(presignedUrl, {
      headers: {'Content-Type': selectedImage.type},
      method: 'PUT',
      body: blob
    })

    if (uploadResponse.ok) {
      console.log('인연 보내기 : s3 파일에 업로드 성공')

      const uploadedUrl = presignedUrl.split('?')[0]; 
      console.log(uploadedUrl);
      // const isValidUrl = await checkUrlValidity(uploadedUrl);
      const isValidUrl = true;
      if (isValidUrl) {
        console.log('S3 파일에 업로드 성공');
        // const content =  {uploadedUrl, fileId};
        setFileId(fileId);
        return fileId; // 업로드된 파일의 URL,fileId 반환
      } else {
        Alert.alert('실패', '업로드된 이미지 URL이 유효하지 않습니다.');
        return null;
      }
    } else {
      Alert.alert('실패', '이미지 업로드에 실패했습니다.');
      return null;
    }
    } catch (error) {
      console.error('인연보내기 사진 error :' ,error);
      Alert.alert('실패', '이미지 업로드 중 오류가 발생했습니다.');
      return null;
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

  const handleSendingMessage = async () => {
    const validState = checkValid();
    if (!validState) {
      return;
    }
    console.log(fileId);
    let updateFileId = fileId;
    if (selectedTag ==='사진' && !updateFileId) {
      updateFileId = await uploadImageToS3();
      setFileId(updateFileId);
    }
    await sendMsg(uuidSet, updateFileId);
    fadeInAndMoveUp();
    setShowMsgBox(false);
    if (sendCountsRef.current === 0)
      return;
    setIsBlocked(true);
    setBlockedTime(Date.now());
    setTimeout(() => {
      setIsBlocked(false);
    }, sendDelayedTime);
  }
  
  // 이미지 제거 함수 추가
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageUrl('');
    setFileId(0);
  };

  const checkValid = () => {
    if (selectedTag ==='사진'){
      if (!imageUrl){
        Alert.alert('사진 없음', '사진을 선택해 주세요!');
        return false
      }
    } else {
      if (msgText.length < 5) {
        Alert.alert('내용을 더 채워 주세요', '5글자 이상 입력해 주세요!');
        return false;
      } 
    }

    if (!isScanning) {
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
      return false
    } else if (isBlocked) {
      Alert.alert('잠시 기다려 주세요', '인연 메세지는 1분에 1번씩 보낼 수 있어요!');
      return false
    } else if (!nearInfo.isNearby || !uuidSet) {
      Alert.alert('주위 인연이 없습니다.', '새로운 인연을 만나기 전까지 기다려주세요!');
      return false
    }
  
    return true;
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
        ]}>
        <Text variant='sub'>{sendCountsRef.current !== 0 ? `${sendCountsRef.current}명에게 인연 메세지를 보냈습니다.` : `메세지를 보낼 수 없는 대상입니다.`}</Text>
      </Animated.View>
      {showMsgBox ? (
          <View style={styles.msgcontainer} >
            <RoundBox width='95%' 
              style={[styles.msgBox, {borderColor : nearInfo.isNearby && !isBlocked && isScanning ? '#14F12A': '#979797'}]}>
              <View style={styles.titleContainer}>
                <Text variant='title' style={styles.title}>인연 메세지 <Button title='💬' onPress={() => {
                  Alert.alert("인연 메세지 작성",`${sendDelayedTime/(60 * 1000)}분에 한번씩 주위의 인연들에게 메세지를 보낼 수 있어요! 메세지를 받기 위해 블루투스 버튼을 켜주세요`)}
                }/> 
                </Text>
                {tags.map((tag) => (
                  <Button titleStyle={[styles.tagText, selectedTag === tag && styles.selectedTag]} 
                    variant='sub' title={`#${tag}`}  onPress={() => setSelectedTag(tag)} 
                    key={tag} activeOpacity={0.6} />
                ))}
              </View>
              <View style={styles.textInputContainer}>
                {selectedTag === "텍스트" ? (
                  <TextInput
                  value={msgText}
                  style={styles.textInput}
                  onChange={(event) => { setMsgText(event.nativeEvent.text);}}
                  placeholder="메세지를 입력하세요"
                  placeholderTextColor="#333"
                  editable={!selectedImage} 
                />
                ): (
                  <View style={[styles.ImageBox, {height:imageUrl? 150 : 50}]}>
                    {imageUrl ? (
                      <>
                      <FastImage
                        style={styles.fullScreenImage}
                        source={{ uri: imageUrl, priority: FastImage.priority.normal }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                      <TouchableOpacity onPress={handleRemoveImage} style={styles.removeImageButton}>
                        <Text style={styles.removeImageButtonText}>×</Text>
                      </TouchableOpacity>
                      </>
                    ) : (
                      <Button title='사진을 추가해주세요🖼️' onPress={()=>{handleSelectImage()}}/> 
                    )}
                  </View>
                )}
            </View>
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
  fullScreenImage: {
    width: '100%',
    height: 150,
  },
  ImageBox: {
    height: 150,
    width: '100%',
    padding: 10,
    justifyContent:'center',
    borderColor: '#000',
    color: '#333',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  tagText:{
    paddingTop: 15,
  },
  selectedTag: {
    color: '#000', 
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
    color: '#333',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  textInputWithImage: {
    paddingLeft: 70, // 이미지 오른쪽에 텍스트가 올 수 있도록 패딩 추가
  },
  buttonContainer: {
    width: '75%',
    position: 'absolute',
    bottom: 10, 
    right: 10,
    zIndex: 2,
    borderTopWidth: 2,
  },
  selectedImage: {
      width: 50,
      height: 50,
  },
  removeImageButton: {
      position: 'absolute',
      top: -10,
      right: -10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
  },
  removeImageButtonText: {
      color: 'white',
      fontSize: 18,
  },
  textInputContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 10,
  },

});

export default MessageBox;
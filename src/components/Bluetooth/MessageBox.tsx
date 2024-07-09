import  React, { useState, useRef } from 'react';
import RoundBox from '../common/RoundBox';
import Button from '../common/Button';
import { StyleSheet, TextInput, View, Alert, Animated, LogBox, TouchableOpacity } from 'react-native';
import Text from '../common/Text';
import { AxiosResponse, FileResponse, SendMatchResponse, SendMsgRequest } from '../../interfaces';
import { axiosPost } from '../../axios/axios.method';
import { urls } from '../../axios/config';
import {  userMMKVStorage } from '../../utils/mmkvStorage';
import { useMMKVBoolean, useMMKVNumber, useMMKVString } from 'react-native-mmkv';
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

interface MessageBoxPrams {
  uuids: Set<string>;
  setShowMsgBox: React.Dispatch<React.SetStateAction<boolean>>
}

const sendDelayedTime = 30 * 1000;

const tags = ['텍스트', '사진'];

const MessageBox: React.FC<MessageBoxPrams> = ({uuids, setShowMsgBox})  => {
  const [msgText, setMsgText] = useMMKVString("map.msgText", userMMKVStorage);
  const [isBlocked, setIsBlocked] = useMMKVBoolean("map.isBlocked", userMMKVStorage);
  const [blockedTime, setBlockedTime] = useMMKVNumber("map.blockedTime", userMMKVStorage);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const sendCountsRef = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [rssiMap, setRssiMap] = useState<Map<string, number>>(null);
  const [selectedTag, setSelectedTag] = useMMKVString("map.selectedTag", userMMKVStorage); 
  const [imageUrl, setImageUrl] = useMMKVString("map.imageUrl", userMMKVStorage); 
  const [fileId, setFileId] = useMMKVNumber("map.fileId", userMMKVStorage); 
  const [selectedImage, setSelectedImage] = useState(null);

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
    await sendMsg(uuids, updateFileId);
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
      <Animated.View
        style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: translateY }],
          }}>
        <Text variant='sub'>{sendCountsRef.current !== 0 ? `${sendCountsRef.current}명에게 인연 메세지를 보냈습니다.` : `메세지를 보낼 수 없는 대상입니다.`}</Text>
      </Animated.View>
      <RoundBox width='95%' style={styles.msgBox}>
        <View style={styles.titleContainer}>
          <Text variant='title' style={styles.title}>인연 메세지 <Button title='💬' onPress={() => {
            Alert.alert("인연 메세지 작성",`${sendDelayedTime/(1000)}초에 한번씩 주위의 인연들에게 메세지를 보낼 수 있어요! 메세지를 받기 위해 블루투스 버튼을 켜주세요`)}
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
        <Button title={'보내기'} variant='main' titleStyle={{color: '#000'}}
          onPress={() => handleSendingMessage()}/>
      </RoundBox>
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
  msgBox: {
    width: '95%',
    paddingTop: 0,
    padding: 20,
    borderTopWidth: 4,
    borderColor: '#14F12A',
    backgroundColor: '#fff',
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
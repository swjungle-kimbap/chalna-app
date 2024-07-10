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
import { useSetRecoilState } from 'recoil';
import { MsgSendCntState } from '../../recoil/atoms';
import { handleImagePicker, handleUploadS3 } from '../../service/FileHandling';

const ignorePatterns = [
  /No task registered for key shortService\d+/,
];

// 패턴에 맞는 로그 메시지를 무시
ignorePatterns.forEach(pattern => {
  LogBox.ignoreLogs([pattern.source]);
});

interface MessageBoxPrams {
  uuids: Set<string>;
  setShowMsgBox: React.Dispatch<React.SetStateAction<boolean>>;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
  fadeInAndMoveUp: () => void;
}

const sendDelayedTime = 30;

const tags = ['텍스트', '사진'];

const MessageBox: React.FC<MessageBoxPrams> = ({uuids, setShowMsgBox, setRemainingTime, fadeInAndMoveUp})  => {
  const [msgText, setMsgText] = useMMKVString("map.msgText", userMMKVStorage);
  const [isBlocked, setIsBlocked] = useMMKVBoolean("map.isBlocked", userMMKVStorage);
  const [blockedTime, setBlockedTime] = useMMKVNumber("map.blockedTime", userMMKVStorage);
  const sendCountsRef = useRef(0);
  const [selectedTag, setSelectedTag] = useMMKVString("map.selectedTag", userMMKVStorage); 
  const [imageUrl, setImageUrl] = useMMKVString("map.imageUrl", userMMKVStorage); 
  const [fileId, setFileId] = useMMKVNumber("map.fileId", userMMKVStorage); 
  const [selectedImage, setSelectedImage] = useState(null);
  const setMsgSendCnt = useSetRecoilState(MsgSendCntState);
  const [textInputHeight, setTextInputHeight] = useState(40); // 기본 높이 설정

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
    setMsgSendCnt(response?.data?.data?.sendCount);
  } 

  const handleSendingMessage = async () => {
    let updateFileId = fileId;
    if (selectedTag ==='사진' && !updateFileId) {
      const {presignedUrl, fileId} = await handleUploadS3(selectedImage, false);
      updateFileId = fileId;
      setFileId(fileId);
    }
    await sendMsg(uuids, updateFileId);
    fadeInAndMoveUp();
    setShowMsgBox(false);
    if (sendCountsRef.current === 0)
      return;

    setIsBlocked(true);
    setBlockedTime(Date.now());
    setRemainingTime(sendDelayedTime);
    const timerId: NodeJS.Timeout | null = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime > 0)
          return prevTime - 1;
        setIsBlocked(false);
        clearInterval(timerId);
        return sendDelayedTime; 
      }); 

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
    }, 1000);
  }
  
  const handleSelectImage = async () => {
    setFileId(0);
    const image = await handleImagePicker();
    if (image) {
      setImageUrl(image.uri);
      setSelectedImage(image);
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageUrl('');
    setFileId(0);
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    const lineHeight = 10; 
    const maxHeight = lineHeight * 5; 

    if (contentHeight <= maxHeight) {
      setTextInputHeight(contentHeight);
    } else {
      setTextInputHeight(maxHeight);
    }
  };

  return (
    <> 
      <RoundBox width='95%' style={styles.msgBox}>
        <View style={styles.titleContainer}>
          <Text variant='title' style={styles.title}>인연 메세지 <Button title='💬' onPress={() => {
            Alert.alert("인연 메세지 작성",`${sendDelayedTime}초에 한번씩 주위의 인연들에게 메세지를 보낼 수 있어요!`)}
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
            <>
            <TextInput
            value={msgText}
            style={styles.textInput}
            onChange={(event) => { setMsgText(event.nativeEvent.text);}}
            placeholder="메세지를 입력하세요"
            placeholderTextColor="#333"
            editable={!selectedImage} 
            multiline
            maxLength={100}
            onContentSizeChange={(e) =>
              handleContentSizeChange(e.nativeEvent.contentSize.width, e.nativeEvent.contentSize.height)
            }
            />
            { msgText.length < 5 ? <Text style={styles.charCount}>메세지를 5글자 이상 입력해주세요</Text> :
              msgText.length > 100 ? <Text style={styles.charCount}>메세지를 100글자 이하로 입력해주세요</Text> :
              <Button title="보내기" titleStyle={{color: '#000'}} onPress={handleSendingMessage} /> }
            </>
          ): (
            <>
            <View style={[styles.ImageBox, {height:imageUrl? 180 : 50}]}>
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
                <Button title='사진을 추가해주세요🖼️' onPress={handleSelectImage}/> 
              )}
            </View>
            { imageUrl &&
              <Button title={'보내기'} variant='main' titleStyle={{color: '#000'}}
              onPress={handleSendingMessage}/> }
            </>      
          )}
      </View>
        </RoundBox>
    </>
  );
};

const styles = StyleSheet.create({
  charCount: {
    color: '#999',
  },
  animatedText : {
    color:'black',
  },
  fullScreenImage: {
    width: '100%',
    height: 150,
  },
  ImageBox: {
    height: 150,
    width: '100%',
    padding: 10,
    justifyContent:'center',
    borderColor: '#333',
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
  },

});

export default MessageBox;
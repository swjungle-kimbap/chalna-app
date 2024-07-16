import  React, { useState, useRef } from 'react';
import RoundBox from '../common/RoundBox';
import Button from '../common/Button';
import { StyleSheet, TextInput, View, Alert, Animated, LogBox, TouchableOpacity, Modal, TouchableWithoutFeedback, Button as RNButton, Image } from 'react-native';
import Text from '../common/Text';
import { AxiosResponse, FileResponse, SendMatchResponse, SendMsgRequest } from '../../interfaces';
import { axiosPost } from '../../axios/axios.method';
import { urls } from '../../axios/config';
import {  setUserMMKVStorage, setDefaultMMKVString, userMMKVStorage} from '../../utils/mmkvStorage';
import { useMMKVBoolean, useMMKVNumber, useMMKVString } from 'react-native-mmkv';
import FastImage from 'react-native-fast-image';
import { useSetRecoilState } from 'recoil';
import { MsgSendCntState } from '../../recoil/atoms';
import { handleImagePicker, uploadImage } from '../../utils/FileHandling';
import { useModal } from '../../context/ModalContext';
import { addDeviceIDList } from '../../utils/matchMmkvStorage';
import fontTheme from '../../styles/FontTheme';
import colorTheme from '../../styles/ColorTheme';

const ignorePatterns = [
  /No task registered for key shortService\d+/,
];

// 패턴에 맞는 로그 메시지를 무시
ignorePatterns.forEach(pattern => {
  LogBox.ignoreLogs([pattern.source]);
});

interface MessageBoxPrams {
  uuids: Set<string>;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
  setShowMsgBox: React.Dispatch<React.SetStateAction<boolean>>;
  fadeInAndMoveUp: () => void;
  visible: boolean;
  onClose: () => void;

}

const sendDelayedTime = 30;

// const tags = ['텍스트', '사진'];
const tags = [
  { name: '텍스트', icon: require('../../assets/text.png') },
  { name: '사진', icon: require('../../assets/photo.png') },
];

const MessageBox: React.FC<MessageBoxPrams> = ({uuids, setRemainingTime, setShowMsgBox, 
  fadeInAndMoveUp, 
  visible, onClose})  => {
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
  const { showModal } = useModal();

  const sendMsg = async ( uuids:Set<string>, fileId : number ) => {
    console.log("send uuids", {uuids});
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

    let sendCount = 0;
    let sentedDeviceIds = [];
    console.log("Received Data", response?.data?.data);
    response?.data?.data.forEach(({ deviceId, status }) => {
      if (status === 'SEND') {
        sentedDeviceIds.push(deviceId);
        sendCount++;
      }
    });
    console.log({sentedDeviceIds});
    addDeviceIDList(sentedDeviceIds);
    sendCountsRef.current = sendCount;
    setMsgSendCnt(sendCount);
  } 

  const handleSendingMessage = async () => {
    let updateFileId = fileId;
    if (selectedTag ==='사진' && !updateFileId) {
      const {uri, fileId} = await uploadImage(selectedImage, "IMAGE");
      updateFileId = fileId;
      setFileId(fileId);
    }
    await sendMsg(uuids, updateFileId);
    setShowMsgBox(false);
    fadeInAndMoveUp();
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
    <Modal
      transparent={true}
      visible={visible}
      // animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>

      <RoundBox style={styles.msgBox}>
        <View style={styles.titleContainer}>

          <Text variant='title' style={styles.title}>인연 메세지</Text>
            <TouchableOpacity onPress={() => {
              showModal("인연 메세지 작성", `${sendDelayedTime}초에 한번씩 주위의 인연들에게 메세지를 보낼 수 있어요!`, () => {}, undefined,false);}
            } style={styles.questionIconContainer}>
              <Image source={require('../../assets/Icons/Question2.png')} style={styles.questionIcon} />
          </TouchableOpacity>

          </View>

            <View style={styles.tagContainer}>
            {tags.map(tag => (
              <TouchableOpacity
                key={tag.name}
                onPress={() => setSelectedTag(tag.name)}
                style={[
                  styles.tagButton,
                  selectedTag === tag.name && styles.selectedTagButton,
                ]}
                activeOpacity={0.6}
              >
                <Image source={tag.icon} style={styles.tagIcon} />
              </TouchableOpacity>
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
              // <>
                  <TouchableOpacity 
                    style={styles.sendButton} 
                    onPress={handleSendingMessage}
                    activeOpacity={0.7}
                    >
                    <Image
                      source={require('../../assets/Icons/SendIcon.png')} // 이미지 아이콘 경로 설정
                      style={styles.sendButtonIcon}
                    />
                  </TouchableOpacity>}
                
            </>
          ): (
            <>
            <View style={[styles.ImageBox, {height:imageUrl? 140 : 72}]}>
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
              <TouchableOpacity onPress={handleSelectImage} style={styles.button}>
                  <Image
                    source={require('../../assets/add_image_icon.png')} // 이미지 아이콘 경로 설정
                    style={styles.icon}
                  />
                  <Text style={styles.buttonText}>사진을 추가해주세요</Text>
                </TouchableOpacity>
              )}
            </View>
            { imageUrl &&
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSendingMessage}
                activeOpacity={0.7}
              >
                <Image
                  source={require('../../assets/send_icon.png')} // 이미지 아이콘 경로 설정
                  style={styles.sendButtonIcon}
                />
              </TouchableOpacity>}
            </>      
          )}
      </View>
        </RoundBox>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    </>
  );
};


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgBox: {
    width: '90%',
    // height: '30%',
    // backgroundColor: '#E2FCFC',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 10, // Android specific: elevation for shadow effect
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // This centers the text horizontally
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative', // To allow absolute positioning of the icon
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  questionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  content: {
    alignItems: 'center',
  },
  textInputContainer: {
    marginBottom: 10,
    width: '100%',
  },
  textInput: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colorTheme.colors.light_sub,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    fontFamily: fontTheme.fonts.sub,
    color:'black',
    elevation: 5, // Android에서의 그림자 효과
  },
  charCount: {
    color: '#999',
    marginBottom: 18,
    marginTop: 15,
    fontSize: 12
  },
  ImageBox: {
    justifyContent: 'center', // 수직 방향 가운데 정렬
    alignItems: 'center', // 수평 방향 가운데 정렬
    paddingVertical: 10,
    marginVertical: 20,
    backgroundColor: colorTheme.colors.light_sub,
    borderRadius: 20,
    elevation: 5,
  },
  fullScreenImage: {
    width: '100%',
    height: 130,
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
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    // backgroundColor: '#E0E0E0', // 선택되지 않은 상태의 배경색
    backgroundColor: '#fff', // 선택되지 않은 상태의 배경색

  },
  selectedTagButton: {
    backgroundColor: '#fff', // 선택된 상태의 배경색
    // backgroundColor: '#DEEDED', // 선택된 상태의 배경색
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  tagIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  button: {
    width: '100%',
    flexDirection: 'column', // 컬럼 방향으로 아이템을 배치합니다.
    alignItems: 'center', // 가운데 정렬
    backgroundColor: colorTheme.colors.light_sub,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,

    shadowColor: '#000', // 그림자 색상
    shadowOffset: {
      width: 0,
      height: 5, // 그림자를 아래쪽으로 이동
    },
    shadowOpacity: 0.3, // 그림자 불투명도
    shadowRadius: 3.84, // 그림자 반경
    elevation: 5, // Android에서의 그림자 효과
  },
  icon: {
    width: 64, // 원하는 아이콘 너비
    height: 64, // 원하는 아이콘 높이
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 5, // 텍스트와 아이콘 사이의 간격 조정
    marginBottom: 5
  },

  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#fff',

    // elevation: 10, // Android에서 그림자를 설정합니다.
  },
  sendButtonIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    color: colorTheme.colors.light_sub
  },
  
});

export default MessageBox;
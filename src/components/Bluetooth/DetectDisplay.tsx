import React, {useEffect, useRef} from 'react';
import {
  View,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Touchable,
} from 'react-native';
import FastImage, {Source} from 'react-native-fast-image';
import styles from './BleComponent.style';
import {userMMKVStorage} from '../../utils/mmkvStorage';
import {useMMKVObject} from 'react-native-mmkv';
import Text from '../common/Text';
import {
  DeviceObject,
  deviceObjectStorage,
} from '../../utils/matchMmkvStorage';
import {useRecoilState} from 'recoil';
import {FriendsMapState} from '../../recoil/atoms';
import ProfileImage from '../common/ProfileImage';
import {axiosGet, axiosPost} from '../../axios/axios.method';
import {ApiResponse} from '../Mypage/FriendCard';
import {urls} from '../../axios/config';
import {navigate} from '../../navigation/RootNavigation';
import {showModal} from '../../context/ModalService';
import DetectIconColor from '../../service/Bluetooth/DetectIconColor';
import useFadeText from '../../hooks/useFadeText';

interface DetectDisplayProps {
  uuids: Set<string>;
  setShowMsgBox: (show: boolean) => void;
}

// 이미지 경로 배열
const images: Source[] = [
  require('../../assets/Icons/chalnaticon/chalna1.png'),
  require('../../assets/Icons/chalnaticon/chalna2.png'),
  require('../../assets/Icons/chalnaticon/chalna3.png'),
  require('../../assets/Icons/chalnaticon/chalna4.png'),
  require('../../assets/Icons/chalnaticon/chalna5.png'),
  require('../../assets/Icons/chalnaticon/chalna6.png'),
  require('../../assets/Icons/chalnaticon/chalna7.png'),
  require('../../assets/Icons/chalnaticon/chalna8.png'),
  require('../../assets/Icons/chalnaticon/chalna9.png'),
];

// 이미지 경로 배열
const msgImages: Source[] = [
  require('../../assets/Icons/chalnaticonMsg/chalna1.png'),
  require('../../assets/Icons/chalnaticonMsg/chalna2.png'),
  require('../../assets/Icons/chalnaticonMsg/chalna3.png'),
  require('../../assets/Icons/chalnaticonMsg/chalna4.png'),
  require('../../assets/Icons/chalnaticonMsg/chalna5.png'),
  require('../../assets/Icons/chalnaticonMsg/chalna6.png'),
  require('../../assets/Icons/chalnaticonMsg/chalna7.png'),
  require('../../assets/Icons/chalnaticonMsg/chalna8.png'),
  require('../../assets/Icons/chalnaticonMsg/chalna9.png'),
];

const tempImage: Source = require('../../assets/images/tempMsg.png');

const uuidColorManager = new DetectIconColor();

const getRandomIcon = (): Source => {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

// LottieView 중심을 기준으로 원의 좌표를 설정
const lottieCenterX = 160; // LottieView의 중심 x 좌표
const lottieCenterY = 200; // LottieView의 중심 y 좌표
const radius = 130; // 원의 반지름

const positions = [
  {top: lottieCenterY - radius, left: lottieCenterX}, // 위
  {
    top: lottieCenterY - radius / 2,
    left: lottieCenterX - (Math.sqrt(3) / 2) * radius,
  }, // 좌상
  {
    top: lottieCenterY - radius / 2,
    left: lottieCenterX + (Math.sqrt(3) / 2) * radius,
  }, // 우상
  {
    top: lottieCenterY + radius / 2,
    left: lottieCenterX - (Math.sqrt(3) / 2) * radius,
  }, // 좌하
  {
    top: lottieCenterY + radius / 2,
    left: lottieCenterX + (Math.sqrt(3) / 2) * radius,
  }, // 우하
  {top: lottieCenterY + radius, left: lottieCenterX}, // 아래
];

const DetectDisplay: React.FC<DetectDisplayProps> = ({uuids, setShowMsgBox}) => {
  const fadeAnimMap = useRef(new Map<string, Animated.Value>()).current;
  const iconMap = useRef(new Map<string, Source>()).current;
  const checkMap = useRef(new Map<string, boolean>()).current;
  const [SendDeviceIdList, setSendDeviceIdList] = useMMKVObject<DeviceObject[]>(
    deviceObjectStorage,
    userMMKVStorage,
  );
  const [friendsMap, setFriendsMap] = useRecoilState(FriendsMapState);
  const [fadeInAndMoveUp, fadeAnim, translateY] = useFadeText();

  useEffect(() => {
    const currentTime = new Date().getTime();
    console.log('SendDeviceIdList updated:', SendDeviceIdList);
    SendDeviceIdList?.forEach(item => {
      const restTime = new Date(item.lastSendAt).getTime() - currentTime;
      console.log('restTime:', restTime);
      if (restTime > 0) {
        checkMap.set(item.deviceId, true);
        setTimeout(() => {
          checkMap.delete(item.deviceId);
        }, restTime);
      }
    });
  }, [SendDeviceIdList]);

  useEffect(() => {
    const newUuids = new Set<string>();

    uuids.forEach(uuid => {
      if (!fadeAnimMap.has(uuid)) {
        const fadeAnim = new Animated.Value(0);

        fadeAnimMap.set(uuid, fadeAnim);
        const isExist = iconMap.get(uuid);
        if (!isExist) {
          const randomIcon = images[uuidColorManager.getColorByUUID(uuid)-1];
          iconMap.set(uuid, randomIcon);
        }

        Animated.timing(fadeAnimMap.get(uuid), {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }
      newUuids.add(uuid);
    });

    fadeAnimMap.forEach((_, uuid) => {
      if (!newUuids.has(uuid)) {
        const fadeAnim = fadeAnimMap.get(uuid);
        if (fadeAnim) {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }).start(() => {
            fadeAnimMap.delete(uuid);
          });
        }
      }
    });
  }, [uuids, checkMap]);

  const handleChat = async user => {
    console.log(user)
    try {
      const response = await axiosGet<ApiResponse>(
        `${urls.GET_FRIEND_LIST_URL}/${user.id}`,
      );
      console.log(response.data);
      if (
        response.data &&
        response.data.data &&
        response.data.data.chatRoomId
      ) {
        const {chatRoomId} = response.data.data;
        try {
          await axiosPost(`${urls.CHATROOM_JOIN_URL}${chatRoomId}`); // 채팅방 참여 api 호출
          navigate('채팅', {chatRoomId: chatRoomId});
        } catch {
          showModal(
            '친구랑 대화하기',
            '채팅방을 찾을 수 없습니다.',
            () => {},
            undefined,
            false,
          );
        }
      } else {
        showModal(
          '친구랑 대화하기',
          '채팅방을 찾을 수 없습니다.',
          () => {},
          undefined,
          false,
        );
      }
    } catch (error) {
      showModal('Error', '대화 실패', () => {}, undefined, false);
      console.error('Error fetching chatroomId:', error);
    }
  };

  return (
    <View style={styles.detectIconContainer}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateY }] }}>
        <Text style={otherstyles.fadeText}>
          이미 메세지를 보낸 대상입니다!
        </Text>
        <Text style={otherstyles.fadeText}>
          10분 뒤에 다시 보낼 수 있어요!
        </Text>
      </Animated.View>
      {Array.from(uuids).map((uuid, index) => {
        const position = positions[index % positions.length];
        return (
          <>
          <Animated.View
            key={uuid}
            style={[
              styles.detectIconWrapper,
              {
                opacity: fadeAnimMap.get(uuid),
                top: position.top,
                left: position.left,
              },
            ]}>
            {friendsMap.get(uuid) ? (
                <TouchableOpacity onPress={() => {handleChat(friendsMap.get(uuid))}}>
                  <View style={{flexDirection: 'column'}}>
                  <ProfileImage
                    profileImageId={friendsMap.get(uuid).profileImageId}
                    avatarStyle={otherstyles.profileImage}
                  />
                  <Text variant='title' style={otherstyles.usenameText}>{friendsMap.get(uuid).username}</Text>
                  </View>
                </TouchableOpacity>
              ) :
            <View style={otherstyles.container}>
              <View style={otherstyles.imageWrapper}>
                  <>
                    <TouchableOpacity onPress={() => {checkMap.get(uuid) ? fadeInAndMoveUp() : setShowMsgBox(true)}}>
                    <FastImage
                      style={[
                        styles.detectIcon,
                        checkMap.get(uuid) && { opacity: 0.8 },
                      ]}
                      source={checkMap.get(uuid) ? msgImages[uuidColorManager.getColorByUUID(uuid) - 1] : iconMap.get(uuid)}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                    </TouchableOpacity>
                  </>
                {/* <Text>{uuid.slice(uuid.length-6)}</Text> */}
              </View>
            </View>}
          </Animated.View>
        </>
      );
      })}
    </View>
  );
};

const otherstyles = StyleSheet.create({
  fadeText: {
    fontSize: 15,
    color:'gray',
    zIndex:3,
  },
  usenameText: {
    marginTop: 4,
    fontSize: 15,
    color: '#254E81'
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 200,
    height: 200,
  },
  overlayImage: {
    top: 30,
    width: 25,
    height: 25,
    position: 'absolute',
    color: 'white',
  },
});

export default DetectDisplay;

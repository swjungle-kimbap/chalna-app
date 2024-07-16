import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import FastImage, { Source } from 'react-native-fast-image';
import styles from './BleComponent.style';
import { userMMKVStorage } from '../../utils/mmkvStorage';
import { useMMKVObject } from 'react-native-mmkv';
import Text from '../common/Text';
import { DeviceObject, deviceObjectStorage, checkDeviceId } from '../../utils/matchMmkvStorage';

interface DetectDisplayProps {
  uuids: Set<string>;
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

const tempImage: Source = require('../../assets/images/tempMsg.png');

const getRandomIcon = (): Source => {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

  // LottieView 중심을 기준으로 원의 좌표를 설정
  const lottieCenterX = 160; // LottieView의 중심 x 좌표
  const lottieCenterY = 200; // LottieView의 중심 y 좌표
  const radius = 130; // 원의 반지름

  const positions = [
    { top: lottieCenterY - radius, left: lottieCenterX }, // 위
    { top: lottieCenterY - radius / 2, left: lottieCenterX - (Math.sqrt(3) / 2) * radius }, // 좌상
    { top: lottieCenterY - radius / 2, left: lottieCenterX + (Math.sqrt(3) / 2) * radius }, // 우상
    { top: lottieCenterY + radius / 2, left: lottieCenterX - (Math.sqrt(3) / 2) * radius }, // 좌하
    { top: lottieCenterY + radius / 2, left: lottieCenterX + (Math.sqrt(3) / 2) * radius }, // 우하
    { top: lottieCenterY + radius, left: lottieCenterX }, // 아래
  ];

const DetectDisplay: React.FC<DetectDisplayProps> = ({ uuids }) => {
  const fadeAnimMap = useRef(new Map<string, Animated.Value>()).current;
  const iconMap = useRef(new Map<string, Source>()).current;
  const checkMap = useRef(new Map<string, boolean>()).current;
  const [SendDeviceIdList, setSendDeviceIdList] = useMMKVObject<DeviceObject[]>(deviceObjectStorage, userMMKVStorage);

  useEffect(() => {
    const currentTime = new Date().getTime();
    console.log('SendDeviceIdList updated:', SendDeviceIdList);
    SendDeviceIdList?.forEach((item)=> {
      const restTime = new Date(item.lastSendAt).getTime() - currentTime;
      if (restTime > 0) {
        console.log('restTime:', restTime);
        checkMap.set(item.deviceId, true);
        setTimeout(() => {
          checkMap.delete(item.deviceId);
        }, restTime);
      }
    })
  }, [SendDeviceIdList]);

  useEffect(() => {
    const newUuids = new Set<string>();

    uuids.forEach((uuid) => {
      if (!fadeAnimMap.has(uuid)) {
        const fadeAnim = new Animated.Value(0);

        fadeAnimMap.set(uuid, fadeAnim);
        const isExist = iconMap.get(uuid);
        if (!isExist) {
          const randomIcon= getRandomIcon();
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
  }, [uuids, SendDeviceIdList]);


  return (
    <View style={styles.detectIconContainer}>
      {Array.from(uuids).map((uuid, index) => {
        const position = positions[index % positions.length];
        return (
          <Animated.View
            key={uuid}
            style={[
              styles.detectIconWrapper,
              {
                opacity: fadeAnimMap.get(uuid),
                top: position.top,
                left: position.left,
              },
            ]}
          >
          <View style={otherstyles.container}>
            <View style={otherstyles.imageWrapper}>
              <FastImage
                style={[styles.detectIcon, checkMap.get(uuid) && { opacity: 0.8 }]}
                source={iconMap.get(uuid)}
                resizeMode={FastImage.resizeMode.contain}
              />
              {checkMap.get(uuid) && 
              <FastImage
                style={[otherstyles.overlayImage]}
                source={tempImage}
                resizeMode={FastImage.resizeMode.contain}
              />}
              {/* <Text>{uuid.slice(uuid.length-6)}</Text> */}
            </View>
          </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const otherstyles = StyleSheet.create({
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

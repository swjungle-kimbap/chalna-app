import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import FastImage, { Source } from 'react-native-fast-image';
import styles from './BleComponent.style';

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

const getRandomIcon = (): Source => {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

const DetectDisplay: React.FC<DetectDisplayProps> = ({ uuids }) => {
  const fadeAnimMap = useRef(new Map<string, Animated.Value>()).current;
  const iconMap = useRef(new Map<string, Source>()).current;

  useEffect(() => {
    uuids.forEach((uuid) => {
      if (!fadeAnimMap.has(uuid)) {
        fadeAnimMap.set(uuid, new Animated.Value(0));
        iconMap.set(uuid, getRandomIcon());
      }
      Animated.timing(fadeAnimMap.get(uuid), {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });

    fadeAnimMap.forEach((anim, uuid) => {
      if (!uuids.has(uuid)) {
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          fadeAnimMap.delete(uuid);
          iconMap.delete(uuid);
        });
      }
    });
  }, [uuids, fadeAnimMap, iconMap]);

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

  return (
    <View style={styles.detectIconContainer}>
      {Array.from(uuids).map((uuid, index) => {
        const position = positions[index % positions.length];

        return (
          <Animated.View
            key={uuid}
            style={[
              styles.detectIconWrapper,
              { opacity: fadeAnimMap.get(uuid), top: position.top, left: position.left },
            ]}
          >
            <FastImage
              style={styles.detectIcon}
              source={iconMap.get(uuid)}
              resizeMode={FastImage.resizeMode.contain}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

export default DetectDisplay;

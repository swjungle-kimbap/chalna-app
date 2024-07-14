import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
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

const createFloatingAnimation = (anim: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: -1,
        duration: 2200, 
        easing:Easing.linear,
        useNativeDriver: true,
      }),
    ])
  );
};

const DetectDisplay: React.FC<DetectDisplayProps> = ({ uuids }) => {
  const fadeAnimMap = useRef(new Map<string, Animated.Value>()).current;
  const floatAnimMap = useRef(new Map<string, Animated.Value>()).current;
  const iconMap = useRef(new Map<string, Source>()).current;

  useEffect(() => {
    uuids.forEach((uuid) => {
      if (!fadeAnimMap.has(uuid)) {
        const fadeAnim = new Animated.Value(0);
        const floatAnim = new Animated.Value(0);
        
        fadeAnimMap.set(uuid, fadeAnim);
        floatAnimMap.set(uuid, floatAnim);
        iconMap.set(uuid, getRandomIcon());

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        createFloatingAnimation(floatAnim).start();
      }
    });

    fadeAnimMap.forEach((anim, uuid) => {
      if (!uuids.has(uuid)) {
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          fadeAnimMap.delete(uuid);
          floatAnimMap.delete(uuid);
          iconMap.delete(uuid);
        });
      }
    });
  }, [uuids, fadeAnimMap, floatAnimMap, iconMap]);

  // LottieView 중심을 기준으로 원의 좌표를 설정
  const lottieCenterX = 160; // LottieView의 중심 x 좌표
  const lottieCenterY = 200; // LottieView의 중심 y 좌표
  const radius = 130; // 원의 반지름
  const angleStep = (2 * Math.PI) / uuids.size;

  const positions = Array.from(uuids).map((_, index) => {
    const angle = index * angleStep;
    return {
      top: lottieCenterY + radius * Math.sin(angle),
      left: lottieCenterX + radius * Math.cos(angle),
    };
  });

  return (
    <View style={styles.detectIconContainer}>
      {Array.from(uuids).map((uuid, index) => {
        const position = positions[index];
        const floatAnim = floatAnimMap.get(uuid);

        if (!floatAnim) {
          return null; // floatAnim이 없을 경우 렌더링하지 않음
        }

        const floatAnimInterpolated = floatAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: [-10, 10], // 위아래로 10픽셀씩 이동
      
        });

        return (
          <Animated.View
            key={uuid}
            style={[
              styles.detectIconWrapper,
              {
                opacity: fadeAnimMap.get(uuid),
                top: position.top,
                left: position.left,
                transform: [{ translateY: floatAnimInterpolated }],
              },
            ]}
          >
            <FastImage
              style={[styles.detectIcon, { width: 60, height: 60 }]} // 아이콘 크기 조정
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

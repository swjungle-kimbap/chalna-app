import { ChatDisconnectOut, localChatJoin, autolocalChat } from "../../service/LocalChat";
import { NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import { useState, useEffect, useRef, useCallback } from "react";
import { GetLocalChatResponse, LocalChatData } from '../../interfaces';
import { axiosGet } from "../../axios/axios.method";
import { urls } from "../../axios/config";
import { AxiosRequestConfig } from "axios";
import { calDistance } from "../../utils/calDistance";
import { Position } from '../../interfaces';
import { getLocalChatRefreshState, LocalChatListState, locationState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useFocusEffect } from "@react-navigation/core";
import Geolocation from "react-native-geolocation-service";
import { getImageUri } from "../../utils/FileHandling";
import { View, StyleSheet, ImageBackground  , Image} from "react-native";
import FastImage from 'react-native-fast-image';
import Text from '../../components/common/Text';

export const distanceLimit = 100;
const DistanceLimit = distanceLimit / 1000;
const OutDistanceLimit = distanceLimit / 1000 * 1.125;
const LocalChatDelayedTime = 10 * 1000;

const defaultImg = require('../../assets/Icons/LocalChatIcon.png');

const LocalChatMarkerOverlay = ({cameraMove}) => {
  const currentLocation = useRecoilValue<Position>(locationState);
  const [localChatList, setLocalChatList] = useRecoilState<LocalChatData[]>(LocalChatListState);
  const updatedLocationRef = useRef(currentLocation);
  const [refresh, setRefresh] = useRecoilState(getLocalChatRefreshState);
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const MovedUpdatedDistance = calDistance(updatedLocationRef.current, currentLocation);
    if (MovedUpdatedDistance > 0.01) {
      updatedLocationRef.current = currentLocation;
      const updateLocalChatRoom = async () => {
        const updatedLocalChatList = await Promise.all(localChatList.map(async (item) => {
          const localChat = item.localChat;
          const distance = calDistance(currentLocation, { latitude: localChat.latitude, longitude: localChat.longitude });
          if (item.isJoined && distance >= OutDistanceLimit) {
            await ChatDisconnectOut(localChat.chatRoomId, setRefresh);
            return null;
          }
          return {
            ...item,
            localChat: {
              ...localChat,
              distance,
            },
          };
        }));
        setLocalChatList(updatedLocalChatList.filter(item => item !== null));
      }
      updateLocalChatRoom();
    }
  }, [currentLocation]);

  const fetchLocalChatList = async () => {
    try {
      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const localChatReqeustBody = {
              params: {
                latitude,
                longitude,
                distance: 400,
              }
            } as AxiosRequestConfig;
            const response = await axiosGet<GetLocalChatResponse>(
              urls.GET_LOCAL_CHAT_URL, "주변 장소 채팅 조회", localChatReqeustBody, false);
  
            if (response.data.data) {
              const updatedLocalChatList = response.data.data.map((item) => {
                const localChat = item.localChat;
                const distance = calDistance({ latitude, longitude }, { latitude: localChat.latitude, longitude: localChat.longitude });
                return {
                  ...item,
                  localChat: {
                    ...localChat,
                    distance,
                  },
                };
              });
              setLocalChatList(updatedLocalChatList);
            }
          } catch (error) {
            console.error("채팅 리스트 요청 실패", error.message);
          }
        },
        (error) => {
          console.error("위치 정보 가져오기 실패", error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error("위치정보 습득 실패", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log("====refreshed!=====");
      fetchLocalChatList();
      const interval = setInterval(() => {
        fetchLocalChatList();
      }, LocalChatDelayedTime);
      return () => clearInterval(interval);
    }, [refresh])
  );

  useEffect(() => {
    const fetchMarkers = async () => {
      if (!localChatList || localChatList.length === 0 || !currentLocation) {
        setMarkers([]);
        return;
      }

      try {
        const markerPromises = localChatList.map(async (item) => {
          const localChat = item.localChat;
          const ImageId = localChat.imageId;
          let ImgSource = defaultImg;
          const imageUri = await getImageUri(ImageId);
          const isDefaultImage = !imageUri;

          if (imageUri) {
            ImgSource = { uri: imageUri };
          }
          const borderColor = localChat.distance >= OutDistanceLimit ? 'gray' : 'white';
          const tintColor = localChat.distance >= OutDistanceLimit ? 'gray' : '#438EE6';  

          return (
            <NaverMapMarkerOverlay
              key={localChat.id}
              latitude={localChat.latitude}
              longitude={localChat.longitude}
    
              onTap={() => {
                cameraMove({ latitude: localChat.latitude, longitude: localChat.longitude });
                item.isJoined ? autolocalChat(localChat, localChat.distance, setRefresh) : localChatJoin(localChat, localChat.distance, setRefresh, imageUri);
              }}
              
              width={100}
              height={100}
              // isHideCollidedMarkers={localChat.distance < DistanceLimit ? false : true}
              isHideCollidedCaptions={true}
            >
              {isDefaultImage ? (
                <View style={styles.defaultImageWrapper}>
                   <ImageBackground
                    source={ImgSource}
                    style={[styles.defaultImage]}
                    imageStyle={{ tintColor }}
                    resizeMode="contain"
                  />
                   <Text style={styles.captionText}>{localChat.name}</Text>
                </View>
              ) : (
                <View style={styles.avatarWrapper}>
                  <FastImage
                    source={ImgSource}
                    style={[styles.avatar, { borderColor }]}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <Text style={styles.captionText}>{localChat.name}</Text>
                </View>
              )}
            </NaverMapMarkerOverlay>
          );
        });

        const resolvedMarkers = await Promise.all(markerPromises);
        setMarkers(resolvedMarkers);
      } catch (error) {
        console.error("error fetching markers: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkers();
  }, [localChatList]);

  return (
    <>
      {isLoading ? <></> : markers}
    </>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  defaultImageWrapper: {
    alignItems: 'center',
    padding: 5,
  },
  defaultImage: {
    width: 50,
    height: 50,
  },
  captionText: {
    marginTop: 5,
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
  },
});

export default LocalChatMarkerOverlay;

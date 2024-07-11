import { ChatDisconnectOut, localChatDelete, localChatJoin, localChatOut } from "../../service/LocalChat";
import { NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import { useState, useEffect, useRef, useCallback } from "react";
import { AxiosResponse, DownloadFileResponse, GetLocalChatResponse, LocalChatData, LocalChatRoomData } from '../../interfaces';
import { axiosGet } from "../../axios/axios.method";
import {urls} from "../../axios/config";
import { AxiosRequestConfig } from "axios";
import { calDistance } from "../../utils/calDistance";
import { Position } from '../../interfaces';
import { getLocalChatRefreshState, JoinedLocalChatListState, LocalChatListState, locationState, ProfileImageMapState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useFocusEffect } from "@react-navigation/core";
import Geolocation from "react-native-geolocation-service";
import { Alert } from "react-native";

const LocalChatDelayedTime = 10 * 1000;
const defaultImg = require('../../assets/Icons/LocalChatIcon.png');

const LocalChatMarkerOverlay = () => {
  const currentLocation = useRecoilValue<Position>(locationState);
  const [joinedLocalChatList, setJoinedLocalChatList] = useRecoilState(JoinedLocalChatListState);
  const [localChatList, setLocalChatList] = useRecoilState<LocalChatData[]>(LocalChatListState);
  const [locationUpdate, setLocationUpdate] = useState(currentLocation);
  const updatedLocationRef = useRef(currentLocation);
  const [refresh, setRefresh] = useRecoilState(getLocalChatRefreshState);
  const [profileImageMap, setProfileImageMap] = useRecoilState(ProfileImageMapState);
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const MovedUpdatedDistance = calDistance(updatedLocationRef.current, currentLocation);
    if (MovedUpdatedDistance > 0.01) {
      updatedLocationRef.current = currentLocation;
      setLocationUpdate(currentLocation);
      const updateLocalChatRoom = async () => {
        const updatedLocalChatRoomData: LocalChatRoomData[] = [];
        // Update localChatList
        const updatedLocalChatList = await Promise.all(localChatList.map(async (item) => {
          const localChat = item.localChat;
          const distance = calDistance(currentLocation, { latitude: localChat.latitude, longitude: localChat.longitude });
          if (item.isJoined && distance >= 0.08) {
            await ChatDisconnectOut(localChat.chatRoomId, setRefresh);
            return null;
          }

          if (item.isJoined) {
            updatedLocalChatRoomData.push({
              chatRoomId: localChat.chatRoomId,
              description: localChat.description,
              name: localChat.name,
              latitude: localChat.latitude,
              longitude: localChat.longitude,
              distance
            })
          }

          return {
            ...item,
            localChat: {
              ...localChat,
              distance,
            },
          };
        }));
      
        setJoinedLocalChatList(updatedLocalChatRoomData.filter(item => item !== null));
        setLocalChatList(updatedLocalChatList.filter(item => item !== null));
      }
      updateLocalChatRoom();
    }
  }, [currentLocation, joinedLocalChatList]);

  const fetchLocalChatList = async () => {
    try {
      // 위치 정보 가져오기
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
              const updatedLocalChatRoomData: LocalChatRoomData[] = [];
              const updatedLocalChatList = response.data.data.map((item) => {
                const localChat = item.localChat;
                const distance = calDistance(currentLocation, {latitude: localChat.latitude, longitude: localChat.longitude});
                if (item.isJoined) {
                  updatedLocalChatRoomData.push({
                    chatRoomId: localChat.chatRoomId,
                    description: localChat.description,
                    name: localChat.name,
                    latitude: localChat.latitude,
                    longitude: localChat.longitude,
                    distance
                  })
                }
                return {
                  ...item,
                  localChat: {
                    ...localChat,
                    distance,
                  },
                };
              });
              setLocalChatList(updatedLocalChatList);
              setJoinedLocalChatList(updatedLocalChatRoomData);
            }
          } catch (error) {
            console.error("채팅 리스트 요청 실패", error.message);
            Alert.alert("채팅 리스트 요청 실패", "채팅 리스트를 가져오는데 실패하였습니다.");
          }
        },
        (error) => {
          console.error("위치 정보 가져오기 실패", error.code, error.message);
          Alert.alert("위치 정보 가져오기 실패", "현재 위치 정보를 가져오는데 실패하였습니다.");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error("위치정보 습득 실패", error.message);
      Alert.alert("위치정보 습득 실패", "현재 위치 정보를 가져오는데 실패하였습니다.");
    }
  };

  useEffect(() => {
    fetchLocalChatList();
  }, [refresh])

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        fetchLocalChatList();
      }, LocalChatDelayedTime);
      return () => clearInterval(interval);
    }, [])
  );

  const getPresignedUrl = async (ImageId) => {
    const downloadResponse = await axiosGet<AxiosResponse<DownloadFileResponse>>(
      `${urls.FILE_DOWNLOAD_URL}${ImageId}`,"장소 채팅 이미지 링크 다운로드" );
    if (downloadResponse?.data?.data) {
      const { presignedUrl } = downloadResponse?.data?.data;
      return presignedUrl
    }
    return null;
  }

  useEffect(() => {
    const fetchMarkers = async () => {
      if (!localChatList || localChatList.length === 0 || !currentLocation) {
        setMarkers([]);
        return;
      }

      try {
        const markerPromises = localChatList.map(async (item) => {
          const localChat = item.localChat;
          const distance = calDistance(currentLocation, { latitude: localChat.latitude, longitude: localChat.longitude });
          const ImageId = localChat.imageId;
          let savedSource = null, ImgSource = defaultImg;
          if (ImageId) {
            savedSource = profileImageMap.get(ImageId);
          } 
  
          if (savedSource) {
            ImgSource = { httpUri: savedSource };
          } else if (ImageId) {
            const presignedUrl = await getPresignedUrl(ImageId);
            
            if (presignedUrl) {
              ImgSource = { httpUri: presignedUrl };
              profileImageMap.set(ImageId, presignedUrl);
            }
          }
          return (
            <NaverMapMarkerOverlay
              key={localChat.id}
              latitude={localChat.latitude}
              longitude={localChat.longitude}
              onTap={item.isJoined ? () => localChatOut(localChat, distance, setRefresh) :
                () => localChatJoin(localChat, distance, setRefresh)
              }
              image={ImgSource}
              tintColor={distance > 0.05 ? 'gray': 'lightgreen'}
              width={ImgSource !== defaultImg? 50 : 40}
              height={ImgSource !== defaultImg? 50 : 40}
              caption={{ text: localChat.name }}
              isHideCollidedMarkers={distance < 0.5 ? false: true}
              isHideCollidedCaptions={true}
            />
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
  }, [localChatList, locationUpdate]);
  return (
    <>
    {isLoading ? <></> : markers }
    </>
  );
};


export default LocalChatMarkerOverlay;

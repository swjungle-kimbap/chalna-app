import { ChatDisconnectOut, localChatDelete, localChatJoin, localChatOut } from "../../service/LocalChat";
import { NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AxiosResponse, DownloadFileResponse, GetLocalChatResponse, LocalChatData, LocalChatRoomData } from '../../interfaces';
import { axiosGet } from "../../axios/axios.method";
import {urls} from "../../axios/config";
import { AxiosRequestConfig } from "axios";
import { calDistance } from "../../utils/calDistance";
import { Position } from '../../interfaces';
import { getLocalChatRefreshState, JoinedLocalChatListState, locationState, ProfileImageMapState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useFocusEffect } from "@react-navigation/core";

const LocalChatDelayedTime = 10 * 1000;
const defaultImg = require('../../assets/Icons/LocalChatIcon.png');

const LocalChatMarkerOverlay = () => {
  const currentLocation = useRecoilValue<Position>(locationState);
  const [joinedLocalChatList, setJoinedLocalChatList] = useRecoilState(JoinedLocalChatListState);
  const [localChatList, setLocalChatList] = useState<LocalChatData[]>([]);
  const [locationUpdate, setLocationUpdate] = useState(currentLocation);
  const updatedLocationRef = useRef(currentLocation);
  const [refresh, setRefresh] = useRecoilState(getLocalChatRefreshState);
  const [profileImageMap, setProfileImageMap] = useRecoilState(ProfileImageMapState);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const MovedUpdatedDistance = calDistance(updatedLocationRef.current, currentLocation);
    if (MovedUpdatedDistance > 0.01) {
      updatedLocationRef.current = currentLocation;
      setLocationUpdate(currentLocation);
      const updateLocalChatRoom = async () => {
        const updatedLocalChatRoomData = await Promise.all(joinedLocalChatList.map(async (item) => {
          const distance = calDistance(currentLocation, {latitude: item.latitude, longitude: item.longitude});
          if (distance >= 0.08) {
            await ChatDisconnectOut(item.chatRoomId, setRefresh);
            return null;
          }
          return {
            ...item,
            distance
          };
        }));
    
        setJoinedLocalChatList(updatedLocalChatRoomData.filter(item => item !== null));
      }
      updateLocalChatRoom();
      //console.log({joinedLocalChatList})
    }
  }, [currentLocation]);

  const fetchLocalChatList = async () => {
    if (currentLocation) {
      const localChatReqeustBody = {
        params: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          distance: 400,
        }
      } as AxiosRequestConfig;
      const response = await axiosGet<GetLocalChatResponse>(
        urls.GET_LOCAL_CHAT_URL, "주변 장소 채팅 조회", localChatReqeustBody, true);

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
    }
    //console.log('updated!!');
  };

  useEffect(() => {
    fetchLocalChatList();
  }, [refresh])

  useFocusEffect(
    useCallback(() => {
      fetchLocalChatList();
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
            ImgSource = { uri: presignedUrl };
            profileImageMap.set(ImageId, presignedUrl);
          }
        }
        
        if (item.isOwner) {
          return (
            <NaverMapMarkerOverlay
              key={localChat.id}
              latitude={localChat.latitude}
              longitude={localChat.longitude}
              onTap={() => localChatDelete(localChat, distance, setRefresh)}
              image={ImgSource}
              tintColor={item.isJoined || distance > 0.05 ? '#3955E5' : 'lightgreen'}
              width={ImgSource !== defaultImg? 50 : 40}
              height={ImgSource !== defaultImg? 50 : 40}
              caption={{ text: localChat.name }}
              isHideCollidedMarkers={true}
            />
          );
        }

        if (item.isJoined) {
          return (
            <NaverMapMarkerOverlay
              key={localChat.id}
              latitude={localChat.latitude}
              longitude={localChat.longitude}
              onTap={() => localChatOut(localChat, distance, setRefresh)}
              image={ImgSource}
              tintColor='#67DBFF'
              width={ImgSource !== defaultImg ? 50 : 40}
              height={ImgSource !== defaultImg ? 50 : 40}
              caption={{ text: localChat.name }}
              isHideCollidedMarkers={true}
            />
          );
        }
        
        return (
          <NaverMapMarkerOverlay
            key={localChat.id}
            latitude={localChat.latitude}
            longitude={localChat.longitude}
            onTap={() => localChatJoin(localChat, distance, setRefresh)}
            image={ImgSource}
            tintColor={distance > 0.05 ? 'gray' : 'lightgreen'}
            width={ImgSource !== defaultImg ? 50 : 40}
            height={ImgSource !== defaultImg ? 50 : 40}
            caption={{ text: localChat.name}}
            isHideCollidedMarkers={true}
          />
        );
      });

      const resolvedMarkers = await Promise.all(markerPromises);
      setMarkers(resolvedMarkers);
    };

    fetchMarkers();
  }, [localChatList, locationUpdate]);

  return (
    <>
      {markers}
    </>
  );
};

export default LocalChatMarkerOverlay;

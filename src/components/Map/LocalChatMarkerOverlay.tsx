import { localChatDelete, localChatJoin, localChatOut, localChatTapHandler } from "../../service/LocalChat";
import { NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GetLocalChatResponse, LocalChat, LocalChatData } from '../../interfaces';
import { axiosGet } from "../../axios/axios.method";
import {urls} from "../../axios/config";
import { AxiosRequestConfig } from "axios";
import { calDistance } from "../../utils/calDistance";
import { Position } from '../../interfaces';
import { getLocalChatRefreshState, JoinedLocalChatListState, locationState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useFocusEffect } from "@react-navigation/core";

const LocalChatDelayedTime = 60 * 1000;

const LocalChatMarkerOverlay = () => {
  const currentLocation = useRecoilValue<Position>(locationState);
  const [joinedLocalChatList, setJoinedLocalChatList] = useRecoilState(JoinedLocalChatListState);
  const [localChatList, setLocalChatList] = useState<LocalChatData[]>([]);
  const locationRef = useRef(currentLocation);
  const [locationMoved, setLocationMoved] = useState(currentLocation);
  const beforeLocationRef = useRef(currentLocation);
  const [locationUpdate, setLocationUpdate] = useState(currentLocation);
  const updatedLocationRef = useRef(currentLocation);
  const [refresh, setRefresh] = useRecoilState(getLocalChatRefreshState);

  useEffect(() => {
    const MovedDistance = calDistance(beforeLocationRef.current, currentLocation);
    const MovedUpdatedDistance = calDistance(updatedLocationRef.current, currentLocation);
    console.log({MovedDistance});
    console.log({MovedUpdatedDistance});
    if (MovedDistance > 0.2) {
      beforeLocationRef.current = currentLocation;
      setLocationMoved(currentLocation);
    }  

    if (MovedUpdatedDistance > 0.01) {
      updatedLocationRef.current = currentLocation;
      setLocationUpdate(currentLocation);
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
        urls.GET_LOCAL_CHAT_URL, "주변 장소 채팅 조회", localChatReqeustBody, false);
      if (response.data.data)
        setLocalChatList(response.data.data);
    }
  };

  useEffect(() => {
    fetchLocalChatList();
  }, [locationMoved, refresh])

  useFocusEffect(
    useCallback(() => {
      fetchLocalChatList();
        const interval = setInterval(() => {
          fetchLocalChatList();
        }, LocalChatDelayedTime);
        return () => clearInterval(interval);
    }, [])
  );

  const renderMarkers = useMemo(() => {
    return localChatList.map((item:LocalChatData) => {
      const localChat = item.localChat;
      if (item.isOwner) {
        return (
          <NaverMapMarkerOverlay
            key={localChat.id}
            latitude={localChat.latitude}
            longitude={localChat.longitude}
            onTap={() => localChatDelete(localChat.name, localChat.chatRoomId, localChat.id, setRefresh)}
            image={require('../../assets/Icons/LocalChatIcon.png')}
            tintColor='#3955E5'
            width={40}
            height={40}
            caption={{text:localChat.name}}
            isHideCollidedMarkers={true}
          />
        )
      }

      if (item.isJoined) {
        return (
          <NaverMapMarkerOverlay
            key={localChat.id}
            latitude={localChat.latitude}
            longitude={localChat.longitude}
            onTap={() => localChatOut(localChat.name, localChat.chatRoomId, setRefresh)}
            image={require('../../assets/Icons/LocalChatIcon.png')}
            tintColor='#67DBFF'
            width={40}
            height={40}
            isHideCollidedMarkers={true}
          />
        )
      }

      const distance = calDistance(locationUpdate, {latitude: localChat.latitude, longitude: localChat.longitude});
      if (distance > 0.05) {
        return (
          <NaverMapMarkerOverlay
            key={localChat.id}
            latitude={localChat.latitude}
            longitude={localChat.longitude}
            onTap={() => localChatJoin(localChat.name, localChat.description, localChat.chatRoomId, false, setRefresh)}
            image={require('../../assets/Icons/LocalChatIcon.png')}
            tintColor='gray'
            width={40}
            height={40}
            isHideCollidedMarkers={true}
          />
        );
      } else {
        return (
          <NaverMapMarkerOverlay
            key={localChat.id}
            latitude={localChat.latitude}
            longitude={localChat.longitude}
            onTap={() => localChatJoin(localChat.name, localChat.description, localChat.chatRoomId, true, setRefresh)}
            image={require('../../assets/Icons/LocalChatIcon.png')}
            tintColor='lightgreen'
            width={40}
            height={40}
            isHideCollidedMarkers={true}
          />
        );
      }
    });
  }, [localChatList, locationUpdate]);

  return (
    <>
      {renderMarkers}
    </>
  );
};

export default LocalChatMarkerOverlay;
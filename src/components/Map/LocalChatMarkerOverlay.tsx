import { localChatTapHandler } from "../../service/LocalChat";
import { NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GetLocalChatResponse, LocalChat } from '../../interfaces';
import { axiosGet } from "../../axios/axios.method";
import {urls} from "../../axios/config";
import { AxiosRequestConfig } from "axios";
import { calDistance } from "../../utils/calDistance";
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import { Position } from '../../interfaces';
import { getLocalChatRefreshState, JoinedLocalChatListState, locationState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useFocusEffect } from "@react-navigation/core";

const LocalChatDelayedTime = 60 * 1000;

const LocalChatMarkerOverlay = () => {
  const currentLocation = useRecoilValue<Position>(locationState);
  const [joinedLocalChatList, setJoinedLocalChatList] = useRecoilState(JoinedLocalChatListState);
  const [localChatList, setLocalChatList] = useState<Array<LocalChat>>([]);
  const locationRef = useRef(currentLocation);
  const [locationMoved, setLocationMoved] = useState(currentLocation);
  const beforeLocationRef = useRef(currentLocation);
  const [locationUpdate, setLocationUpdate] = useState(currentLocation);
  const updatedLocationRef = useRef(currentLocation);
  const getRefresh = useRecoilValue(getLocalChatRefreshState);

  useChangeBackgroundSave<Position>('lastLocation', currentLocation);
  
  useEffect(() => {
    const MovedDistance = calDistance(beforeLocationRef.current, currentLocation);
    const MovedUpdatedDistance = calDistance(updatedLocationRef.current, currentLocation);
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
  }, [locationMoved, getRefresh])

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
    return localChatList.map((item) => {
      const distance = calDistance(locationUpdate, {latitude: item.latitude, longitude: item.longitude});
      if (distance > 0.05) {
        return (
          <NaverMapMarkerOverlay
            key={item.id}
            latitude={item.latitude}
            longitude={item.longitude}
            onTap={() => localChatTapHandler(item.name, item.description, item.chatRoomId, false)}
            image={require('../../assets/Icons/LocalChatIcon.png')}
            tintColor='gray'
            width={40}
            height={40}
          />
        );
      } else {
        return (
          <NaverMapMarkerOverlay
            key={item.id}
            latitude={item.latitude}
            longitude={item.longitude}
            onTap={() => localChatTapHandler(item.name, item.description, item.chatRoomId, true)}
            image={require('../../assets/Icons/LocalChatIcon.png')}
            tintColor='lightgreen'
            width={40}
            height={40}
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
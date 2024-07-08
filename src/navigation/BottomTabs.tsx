import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet, ActivityIndicator } from 'react-native';
import MapScreen from '../screens/Map/MapScreen';
import FontTheme from "../styles/FontTheme";
import MypageStackScreen from "./MypageStack";
import FriendsStackScreen from "./FriendsStack";
import ChattingStackScreen from "./ChattingStack";
import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { locationState, ProfileImageMapState } from '../recoil/atoms';
import { getMMKVObject } from '../utils/mmkvStorage';
import { AxiosResponse, Friend, Position } from '../interfaces';
import { initUserSetting } from '../service/Setting';
import { axiosGet } from "../axios/axios.method";
import { urls } from "../axios/config";
import { handleDownloadProfile } from "../service/Friends/FriendListAPI";
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const setLastLocation = useSetRecoilState(locationState);
  const [profileImageMap, setProfileImageMap] = useRecoilState(ProfileImageMapState)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lastLocation = getMMKVObject<Position>('map.lastLocation');
    if (lastLocation) {
      setLastLocation(lastLocation);
    }
    initUserSetting();
    const fetchData = async () => {
      const response = await axiosGet<AxiosResponse<Friend[]>>(urls.GET_FRIEND_LIST_URL);
      console.log("friend api response: ", response.data.data);
      const friends = response.data.data;
      const updatedProfileImageMap = new Map(profileImageMap);

      for (const friend of friends) {
        const profileImageUri = updatedProfileImageMap.get(friend.profileImageId);
        if (!profileImageUri && friend.profileImageId) {
          const newProfileImageUri = await handleDownloadProfile(friend.profileImageId);
          updatedProfileImageMap.set(friend.profileImageId, newProfileImageUri);
          console.log('새로 다운받은 프로필 이미지 : ', newProfileImageUri);
        }
      }
      setProfileImageMap(updatedProfileImageMap);
    }
    fetchData();
    setIsLoading(false);
  }, [setLastLocation]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#3EB297" />

  }
  return (
      <Tab.Navigator initialRouteName="지도"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconSource;
            switch (route.name) {
              case '친구목록' :
                iconSource = require("../assets/Icons/FriendsIcon.png");;
                break;
              case '지도':
                iconSource = require("../assets/Icons/MapIcon.png");
                break;
              case '채팅목록':
                iconSource = require("../assets/Icons/MessageIcon.png");
                break;
              case '마이페이지':
                iconSource = require("../assets/Icons/MypageIcon.png");
                break;
            }
            return <Image source={iconSource} resizeMode="contain"
                    style={{ width: size, height: size, tintColor: color }} />;
          },
          tabBarActiveTintColor: '#3EB297',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: styles.tabContainer,
          tabBarLabelStyle : {
            fontFamily: FontTheme.fonts.main,
            fontSize: 10,
          },
          tabBarLabelShown: false,
          headerTitleStyle: {
            fontFamily: FontTheme.fonts.title,
            fontSize: 20,
          },
          headerShown: false
        })}>
      <Tab.Screen name="친구목록" component={FriendsStackScreen} />
      <Tab.Screen name="지도" component={MapScreen}/>
      <Tab.Screen name="채팅목록" component={ChattingStackScreen}/>
      <Tab.Screen name="마이페이지" component={MypageStackScreen}/>
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabContainer: {
      position: 'static',
      left: '2.5%',
      bottom: 10,
      width: '95%',
      height: 50,
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      justifyContent: 'space-around',
      paddingHorizontal: 10,
      alignItems: 'center',
  },
});


export default BottomTabs;

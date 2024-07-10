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
import { getMMKVObject, setMMKVObject } from '../utils/mmkvStorage';
import { AxiosResponse, Friend, Position } from '../interfaces';
import { initUserSetting } from '../service/Setting';
import { axiosGet } from "../axios/axios.method";
import { urls } from "../axios/config";
import { handleDownloadProfile } from "../service/Friends/FriendListAPI";
import BluetoothScreen from "../screens/BlueTooth/BluetoothScreen";
import Text from "../components/common/Text";
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const setLastLocation = useSetRecoilState(locationState);
  setMMKVObject('user.profileImgMap', new Map([[0, '../../assets/images/anonymous.png']]));
  const [profileImageMap, setProfileImageMap] = useRecoilState(ProfileImageMapState)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const lastLocation = getMMKVObject<Position>('map.lastLocation');
      if (lastLocation) {
        setLastLocation(lastLocation);
      }
      initUserSetting();

      try {
        const response = await axiosGet<AxiosResponse<Friend[]>>(urls.GET_FRIEND_LIST_URL);
        console.log("friend api response: ", response.data.data);
        const friends = response.data.data;
        for (const friend of friends) {
          const profileImageUri = profileImageMap.get(friend.profileImageId);
          console.log(profileImageUri, friend.profileImageId);
          if (!profileImageUri && friend.profileImageId) {
            const newProfileImageUri = await handleDownloadProfile(friend.profileImageId);
            profileImageMap.set(friend.profileImageId, newProfileImageUri);
            console.log('새로 다운받은 프로필 이미지 : ', newProfileImageUri);
          }
        }
      } catch (error) {
        console.error("Error fetching friend list or updating profile images: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [setLastLocation, setProfileImageMap]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#3EB297" />

  }
  return (
      <Tab.Navigator initialRouteName="블루투스"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconSource;
            switch (route.name) {
              case '인연':
                iconSource = require("../assets/Icons/Airplane.png");
                break
              case '지도':
                iconSource = require("../assets/Icons/MapIcon.png");
                break;
              case '채팅목록':
                iconSource = require("../assets/Icons/MessageIcon.png");
                break;
              case '친구목록' :
                iconSource = require("../assets/Icons/FriendsIcon.png");;
                break;
            }
            return <Image source={iconSource} resizeMode="contain"
                    style={{ width: size, height: size, tintColor: color, marginTop: 7 }} />;
          },
          tabBarLabel: ({ focused }) => {
            let labelStyle = {
              fontFamily: focused ? FontTheme.fonts.title : FontTheme.fonts.sub,
              fontSize: focused ? 12 : 10,
              color: focused ? '#3EB297' : 'gray',
              marginBottom: 4,
            };
            return <Text style={labelStyle}>{route.name}</Text>;
          },
          tabBarActiveTintColor: '#3EB297',
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
      <Tab.Screen name="인연" component={BluetoothScreen}/>    
      <Tab.Screen name="지도" component={MapScreen}/>
      <Tab.Screen name="채팅목록" component={ChattingStackScreen}/>
      <Tab.Screen name="친구목록" component={FriendsStackScreen} />
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

import React, { useEffect, useState } from 'react';
import { View, Keyboard, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from '../screens/Map/MapScreen';
import FontTheme from "../styles/FontTheme";
import FriendsStackScreen from "./FriendsStack";
import ChattingStackScreen from "./ChattingStack";
import { useRecoilState, useSetRecoilState } from 'recoil';
import { locationState } from '../recoil/atoms';
import { getMMKVObject, getMMKVString } from '../utils/mmkvStorage';
import { AxiosResponse, Friend, Position } from '../interfaces';
import { useLogoutAndWithdrawal } from '../service/Setting';
import { axiosGet } from "../axios/axios.method";
import { urls } from "../axios/config";
import BluetoothScreen from "../screens/BlueTooth/BluetoothScreen";
import Text from "../components/common/Text";
import { getImageUri } from '../utils/FileHandling';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
    const setLastLocation = useSetRecoilState(locationState);
    const [isLoading, setIsLoading] = useState(true);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const { initUserSetting } = useLogoutAndWithdrawal();

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
      const initialize = async () => {
          const lastLocation = getMMKVObject<Position>('map.lastLocation');
          if (lastLocation) {
              setLastLocation(lastLocation);
          }
          await initUserSetting();

          try {
            const response = await axiosGet<AxiosResponse<Friend[]>>(urls.GET_FRIEND_LIST_URL);
            const friends = response.data.data;
            for (const friend of friends) {
              if (friend.profileImageId) {
                await getImageUri(friend.profileImageId);
              }
            }
          } catch (error) {
              console.error("Error fetching friend list or updating profile images: ", error);
          } finally {
              setIsLoading(false);
          }
      };

      initialize();
    }, [setLastLocation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )}
  return (
      <Tab.Navigator initialRouteName="지도"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconSource;
            switch (route.name) {
              case '인연':
                iconSource = require("../assets/Icons/MypageIcon.png");
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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


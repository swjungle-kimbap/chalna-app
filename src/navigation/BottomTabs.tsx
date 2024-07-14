import React, { useEffect, useState } from 'react';
import { View, Keyboard, Image, StyleSheet, ActivityIndicator,Animated } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from '../screens/Map/MapScreen';
import FontTheme from "../styles/FontTheme";
import FriendsStackScreen from "./FriendsStack";
import ChattingStackScreen from "./ChattingStack";
import { useSetRecoilState } from 'recoil';
import { locationState } from '../recoil/atoms';
import { getMMKVObject } from '../utils/mmkvStorage';
import { AxiosResponse, Friend, Position } from '../interfaces';
import { useLogoutAndWithdrawal } from '../service/Setting';
import { axiosGet } from "../axios/axios.method";
import { urls } from "../axios/config";
import BluetoothScreen from "../screens/BlueTooth/BluetoothScreen";
import Text from "../components/common/Text";
import { getImageUri } from '../utils/FileHandling';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import { BackHandler } from 'react-native';
import { navigationRef } from './RootNavigation';


const Tab = createBottomTabNavigator();


const BottomTabs = () => {
    const setLastLocation = useSetRecoilState(locationState);
    const [isLoading, setIsLoading] = useState(true);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const { initUserSetting } = useLogoutAndWithdrawal();

    const [previousRoute, setPreviousRoute] = useState<{name:string; params:null|object}>(null);
    const navigation = useNavigation();


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
          setIsLoading(false);
          initUserSetting();

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
          } 
      };

      initialize();
    }, [setLastLocation]);
  
    useEffect(() => {
      const getPreviousRoute = () => {
        const routes = navigation.getState().routes;
        if (routes.length > 1) {
          const previous = routes[routes.length - 2];
          setPreviousRoute(previous);
        }
      };
  
      const unsubscribe = navigation.addListener('state', getPreviousRoute);
  
      const backHandler = () => {
        navigation.getParent()?.goBack(); 
        if (previousRoute && previousRoute.name) {
          navigation.navigate(previousRoute.name, previousRoute.params);
          return true;
        }
        return false;
      };
  
      const backHandlerListener = BackHandler.addEventListener(
        'hardwareBackPress',
        backHandler
      );
  
      return () => {
        unsubscribe();
        backHandlerListener.remove();
      };
    }, [navigation, previousRoute]);
  

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )}
  return (
      <Tab.Navigator initialRouteName="지도"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused,color, size }) => {
            let iconSource;
            switch (route.name) {
              case '인연':
                iconSource = focused ? require ("../assets/Icons/PaperPlaneIcon_focus.png")
                : require ("../assets/Icons/PaperPlaneIcon.png");
                break
              case '지도':
                iconSource = require("../assets/Icons/MapIcon.png");
                break;
              case '대화':
                iconSource = focused ? require("../assets/Icons/ChatingIcon.png")
                : require ("../assets/Icons/ChatingIcon.png");
                break;
              case '친구' :
                iconSource = require("../assets/Icons/FriendsIcon.png")
            }
            const animatedValue = new Animated.Value(focused ? 1.5 : 1.0);

            if (focused) {
                Animated.spring(animatedValue, {
                    toValue: 1.2,
                    friction: 7,
                    tension: 5,
                    useNativeDriver: true,
                }).start();
            }

            return <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
                    <Image source={iconSource} resizeMode="contain"
                    style={{ width: size, height: size, tintColor: color, marginTop: 7,marginBottom: 12 }} />
                    </Animated.View>;
          },
          tabBarLabel: ({ focused }) => {
            
            let labelStyle = {
              fontFamily: focused ? FontTheme.fonts.title : FontTheme.fonts.title,
              fontSize: focused ? 13 : 11,
              color: focused ? '#3EB297' : 'gray',
              marginBottom: 6,
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
      <Tab.Screen name="대화" component={ChattingStackScreen}/>
      <Tab.Screen name="친구" component={FriendsStackScreen} />
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
      width: '100%',
      height: 65,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 10,
      paddingVertical: 12,
      alignItems: 'center',
  },
});

export default BottomTabs;


import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet } from 'react-native';
import MapScreen from '../screens/Map/MapScreen';
import FontTheme from "../styles/FontTheme";
import MypageStackScreen from "./MypageStack";
import FriendsStackScreen from "./FriendsStack";
import ChattingStackScreen from "./ChattingStack";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
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
          tabBarActiveTintColor: 'blue',
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
      position: 'absolute',
      left: '2.5%',
      bottom: 10,
      width: '95%',
      height: 50,
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      justifyContent: 'space-around',
      paddingHorizontal: 10,
      paddingVertical: 5,
      paddingBottom: 5,
      alignItems: 'center',
  },
});


export default BottomTabs;

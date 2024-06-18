import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from 'react-native';
import MypageScreen from './MypageScreen';
import MapScreen from './MapScreen';
import FriendsScreen from "./FriendsScreen";
import MessageScreen from "./MessageScreen";
import FriendIcon from "../assets/Icons/FriendIcon.png";
import MapIcon from "../assets/Icons/MapIcon.png";
import MessageIcon from "../assets/Icons/MessageIcon.png";
import MypageIcon from "../assets/Icons/MypageIcon.png";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
      <Tab.Navigator initialRouteName="Map"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconSource;

            if (route.name === 'Friends') {
              iconSource = FriendIcon;
            } else if (route.name === 'Map') {
              iconSource = MapIcon;
            } else if (route.name === 'Message') {
              iconSource = MessageIcon;
            } else if (route.name === 'MyPage') {
              iconSource = MypageIcon;
            }

            return <Image source={iconSource} style={{ width: size, height: size, tintColor: color }} resizeMode="contain"/>;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
        })}>
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Map" component={MapScreen} options={{headerShown: false, }}/>
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="MyPage" component={MypageScreen} />
    </Tab.Navigator>
  )
}

export default BottomTabs;
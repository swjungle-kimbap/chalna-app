import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet } from 'react-native';
import MypageScreen from '../screens/MypageScreen';
import MapScreen from '../screens/MapScreen';
import FriendsScreen from "../screens/FriendsScreen";
import MessageScreen from "../screens/MessageScreen";
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
          tabBarStyle: styles.tabContainer,
        })}>
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Map" component={MapScreen} options={{headerShown: false, }}/>
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="MyPage" component={MypageScreen} />
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
      backgroundColor: '#F8F7FB',
      borderRadius: 15,
      justifyContent: 'space-around',
      paddingHorizontal: 10,
      alignItems: 'center',
  },
});


export default BottomTabs;
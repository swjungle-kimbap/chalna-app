import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontTheme from "../styles/FontTheme"
import FriendsScreen from "../screens/Friends/FriendsScreen";
import BlockFriendsScreen from "../screens/Friends/BlockFriendsScreen";
import FriendRequestScreen from "../screens/Friends/FriendRequestScreen";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";

const FriendsStack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const FriendsStackScreen = () => {
  return (
    <FriendsStack.Navigator initialRouteName="친구 목록"
    screenOptions={() => ({
      headerTitleStyle: {
        fontFamily: FontTheme.fonts.title,
        fontSize: 20,
      }
    })}>
      <FriendsStack.Screen name='친구 목록' component={FriendsScreen}/>
      <FriendsStack.Screen name='Tabs' component={Tabs}/>
    </FriendsStack.Navigator>
  );
}

const Tabs = () => {
  return (
      <Tab.Navigator>
        <Tab.Screen name="차단친구 목록" component={BlockFriendsScreen} options={{ tabBarLabel: '차단친구' }} />
        <Tab.Screen name="친구요청 목록" component={FriendRequestScreen} options={{ tabBarLabel: '친구요청' }} />
      </Tab.Navigator>
  );
}


export default FriendsStackScreen;

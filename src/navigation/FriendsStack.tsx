import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontTheme from "../styles/FontTheme"
import FriendsScreen from "../screens/Friends/FriendsScreen";
import MypageStackScreen from "./MypageStack";
import FriendLogScreen from "../screens/Friends/FriendLogScreen";
import FriendRequestScreen from "../screens/Friends/FriendRequestScreen";

const FriendsStack = createNativeStackNavigator();

const FriendsStackScreen = () => {
  return (
    <FriendsStack.Navigator initialRouteName="친구 목록"
    screenOptions={() => ({
      headerTitleStyle: {
        fontFamily: FontTheme.fonts.title,
        fontSize: 20,
      }
    })}>
      <FriendsStack.Screen name='친구 목록' component={FriendsScreen} options={{headerShown:false}}/>
      <FriendsStack.Screen name='마이페이지' component={MypageStackScreen} options={{headerShown:false}}/>
      <FriendsStack.Screen name='스쳐간 기록' component={FriendLogScreen}/>
      <FriendsStack.Screen name='친구요청 목록' component={FriendRequestScreen}/>
      {/*<FriendsStack.Screen name='차단' component={BlockFriendsScreen}/>*/}
    </FriendsStack.Navigator>
  );
}

export default FriendsStackScreen;

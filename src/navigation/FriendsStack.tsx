import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontTheme from "../styles/FontTheme"
import FriendsScreen from "../screens/Friends/FriendsScreen";
import BlockFriendsScreen from "../screens/Friends/BlockFriendsScreen";

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
      <FriendsStack.Screen name='친구 목록' component={FriendsScreen}/>
      <FriendsStack.Screen name='차단친구 목록' component={BlockFriendsScreen}/>
    </FriendsStack.Navigator>
  );
}

export default FriendsStackScreen;
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontTheme from "../styles/FontTheme"
import FriendsScreen from "../screens/Friends/FriendsScreen";
import MypageStackScreen from "./MypageStack";

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
      <FriendsStack.Screen name='마이 페이지' component={MypageStackScreen} options={{headerShown:false}}/>
    </FriendsStack.Navigator>
  );
}

export default FriendsStackScreen;

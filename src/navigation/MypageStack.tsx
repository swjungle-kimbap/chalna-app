import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingScreen from "../screens/Mypage/SettingScreen";
import MypageScreen from "../screens/Mypage/MypageScreen";
import TagSelectScreen from "../screens/Mypage/TagSelectScreen";
import FontTheme from "../styles/FontTheme"

const MypageStack = createNativeStackNavigator();

const MypageStackScreen = () => {
  return (
    <MypageStack.Navigator initialRouteName="마이 페이지"
    screenOptions={() => ({
      headerTitleStyle: {
        fontFamily: FontTheme.fonts.title, 
        fontSize: 20,
      }
    })}>
      <MypageStack.Screen name='마이 페이지' component={MypageScreen}/>
      <MypageStack.Screen name='앱 설정' component={SettingScreen}/>
      <MypageStack.Screen name='선호 태그 설정' component={TagSelectScreen}/>
    </MypageStack.Navigator>
  );
}

export default MypageStackScreen;
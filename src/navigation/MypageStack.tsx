import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingScreen from "../screens/Mypage/SettingScreen";
import MypageScreen from "../screens/Mypage/MypageScreen";
import FontTheme from "../styles/FontTheme"
import NotDisturbTimeSelectScreen from "../screens/Mypage/NotDisturbTimeSelectScreen";
import KeywordSelectScreen from "../screens/Mypage/KeywordSelectScreen";
import BluetoothSettingScreen from "../screens/Mypage/BluetoothSettingScreen";

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
      <MypageStack.Screen name='키워드 알림 설정' component={KeywordSelectScreen}/>
      <MypageStack.Screen name='방해금지 시간 설정' component={NotDisturbTimeSelectScreen}/>
      <MypageStack.Screen name='블루투스 설정' component={BluetoothSettingScreen}/>
    </MypageStack.Navigator>
  );
}

export default MypageStackScreen;
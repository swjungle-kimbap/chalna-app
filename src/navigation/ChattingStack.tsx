import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontTheme from "../styles/FontTheme"
import ChattingListScreen from "../screens/Chatting/ChattingListScreen";
import ChattingScreen from "../screens/Chatting/ChattingScreen";

const ChattingStack = createNativeStackNavigator();

const ChattingStackScreen = () => {
  return (
    <ChattingStack.Navigator initialRouteName="채팅 목록"
    screenOptions={() => ({
      headerTitleStyle: {
        fontFamily: FontTheme.fonts.title, 
        fontSize: 20,
      }
    })}>
      <ChattingStack.Screen name='채팅 목록' component={ChattingListScreen}/>
      <ChattingStack.Screen name='채팅' component={ChattingScreen}/>
    </ChattingStack.Navigator>
  );
}

export default ChattingStackScreen;
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChattingListScreen from "../screens/Chatting/ChattingListScreen";
import ChattingScreen from "../screens/Chatting/ChattingScreen";
import FontTheme from "../styles/FontTheme"
// test
import ChatRoomListScreen from "../database/test/ChatRoomListTestScreen.tsx";

const ChattingStack = createNativeStackNavigator();

const ChattingStackScreen = () => {
    return (
        <ChattingStack.Navigator
            initialRouteName="채팅 목록"
            screenOptions={{
                headerTitleStyle: {
                    fontFamily: FontTheme.fonts.title,
                    fontSize: 20,
                },
            }}
        >
            <ChattingStack.Screen
                name="채팅 목록"
                component={ChatRoomListScreen} //testing purpose
                options={{ title: 'Chat Rooms' }}
            />
            <ChattingStack.Screen
                name="채팅"
                component={ChattingScreen}
                options={{ title: 'Chat' }}
            />
        </ChattingStack.Navigator>
    );
};

export default ChattingStackScreen;

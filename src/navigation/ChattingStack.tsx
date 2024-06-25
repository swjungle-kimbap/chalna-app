import React, {useEffect} from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {getFocusedRouteNameFromRoute, NavigationContainer} from "@react-navigation/native";
// screens
import ChattingListScreen from "../screens/Chatting/ChattingListScreen";
import ChattingScreen from "../screens/Chatting/ChattingScreen";
import FontTheme from "../styles/FontTheme"

const ChattingStack = createNativeStackNavigator();

const ChattingStackScreen = ({ navigation, route }) => {
    // useEffect(() => {
    //     const routeName = getFocusedRouteNameFromRoute(route) ?? '채팅 목록';
    //     const parentNavigation = navigation.getParent();
    //     const gparentNavigation = parentNavigation.getParent();
    //
    //     if (routeName === '채팅') {
    //         parentNavigation?.setOptions({ tabBarStyle: {display: 'none'}, tabBarVisible: false});
    //         gparentNavigation?.setOptions({ tabBarStyle: {display: 'none'}, tabBarVisible: false});
    //         return () =>
    //             parentNavigation?.setOptions({tabBarStyle: undefined, tabBarVisible: undefined});
    //     }
    // }, [navigation, route]);

    return (
        <ChattingStack.Navigator initialRouteName="채팅 목록">
            <ChattingStack.Screen name='채팅 목록' component={ChattingListScreen} />
            <ChattingStack.Screen name='채팅' component={ChattingScreen} options={()=>({
                tabBarStyle: {
                    display: "none",
                },
                tabBarVisible: false
                //tabBarButton: () => null,
            })} />
        </ChattingStack.Navigator>
    );
}


export default ChattingStackScreen;

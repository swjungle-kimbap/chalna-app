import React from "react";
import {Image, StyleSheet, Text, View} from "react-native";
import { createBottomTabNavigator} from "@react-navigation/bottom-tabs";

// import icons
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

// import screens
// import Home from '../screens/Home';
import Friends from '../screens/Friends';
import Map from '../screens/Map';
import MyPage from '../screens/MyPage';
import Chat from '../screens/Chat';

const Tab = createBottomTabNavigator();

const Tabs = () => {

    return(
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {...styles.tabContainer},
                // tabBarShowLabel: false,
            }}
        >
            <Tab.Screen name = "Friends" component ={Friends} options={{

            }}/>
            <Tab.Screen name = "Map" component ={Map} options={{
                headerShown: false,
            }}/>
            <Tab.Screen name = "Chat" component ={Chat} options={{

            }}/>
            <Tab.Screen name = "MyPage" component ={MyPage} options={{

            }}/>
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        position: 'absolute',
        left: '2.5%',
        bottom: 10,
        width: '95%',
        height: 70,
        backgroundColor: '#F8F7FB',
        borderRadius: 20,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
});

export default Tabs;

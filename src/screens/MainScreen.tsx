import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabs from '../navigation/BottomTabs';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './Login/LoginScreen';
import { isReadyRef, navigationRef } from '../navigation/RootNavigation';
import {BufferProvider} from "../context/BufferContext";
import ChattingScreen from './Chatting/ChattingScreen';
import {setMMKVString} from "../utils/mmkvStorage";
import { useEffect } from 'react';
import { NavigationProvider } from '../navigation/NavigtaionContext';


const MainScreen : React.FC = () => {
  const LogInStack = createBottomTabNavigator();

    const handleStateChange = (state) => {
        const currentRoute = state.routes[state.index];
        // console.log("===currentRoute: ", state.routes[state.index]);
        setMMKVString('currentRouteName', currentRoute.name);
    };
  return (
      <NavigationProvider>
          <BufferProvider>
            <NavigationContainer
                ref={navigationRef}
                onReady={()=> {
                    isReadyRef.current = true;
                }}
                onStateChange={handleStateChange}
            >
              <LogInStack.Navigator
                initialRouteName='로그인'
                screenOptions={{
                  headerShown: false,
                  tabBarStyle: { display: 'none' },
                }}
              >
                <LogInStack.Screen name="로그인" component={LoginScreen}/>
                <LogInStack.Screen name="로그인 성공" component={BottomTabs}/>
                  <LogInStack.Screen name='채팅' component={ChattingScreen} options={{headerShown: false }}/>

              </LogInStack.Navigator>
            </NavigationContainer>
          </BufferProvider>
      </NavigationProvider>
  );
}

export default MainScreen;

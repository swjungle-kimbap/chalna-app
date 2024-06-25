import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabs from '../navigation/BottomTabs';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './Login/LoginScreen';
import { isReadyRef, navigationRef } from '../navigation/RootNavigation';
import { linking } from '../service/handleFCM';

const MainScreen : React.FC = () => {
  const LogInStack = createBottomTabNavigator();
  return (
    <NavigationContainer ref={navigationRef} onReady={()=> {
      isReadyRef.current = true; 
    }} linking = {linking}>
      <LogInStack.Navigator
        initialRouteName='로그인'
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, 
        }}
      > 
        <LogInStack.Screen name="로그인" component={LoginScreen}/>
        <LogInStack.Screen name="로그인 성공" component={BottomTabs}/>
      </LogInStack.Navigator>
    </NavigationContainer>
  );
}

export default MainScreen;
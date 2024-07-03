import { ThemeProvider } from 'styled-components/native';
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';
import { RecoilRoot } from 'recoil';
import React, { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { navigate } from './src/navigation/RootNavigation';
import messaging from '@react-native-firebase/messaging';


export default function App() {
  return (
    <ThemeProvider theme={FontTheme}>
      <RecoilRoot>
        <MainScreen />
      </RecoilRoot>
    </ThemeProvider>
  );
}

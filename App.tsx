import { ThemeProvider } from 'styled-components/native';
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';
import { RecoilRoot } from 'recoil';
import React, { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';

export default function App() {
  useEffect(() => {
    // 이벤트 리스너 등록
    const subscription = DeviceEventEmitter.addListener('FCMOpenScreen', (event) => {
      const { screen, screenId } = event;
      if (screen) {
        console.log('Joo Received screen value in App:', screen, screenId);
      } else {
        console.log('Screen value is null or undefined');
      }
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ThemeProvider theme={FontTheme}>
      <RecoilRoot>
        <MainScreen />
      </RecoilRoot>
    </ThemeProvider>
  );
}

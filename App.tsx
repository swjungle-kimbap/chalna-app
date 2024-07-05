import { ThemeProvider } from 'styled-components/native';
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';
import { RecoilRoot } from 'recoil';
import React from 'react';
export default function App() {
  return (
      <ThemeProvider theme={FontTheme}>
        <RecoilRoot>
          <MainScreen />
        </RecoilRoot>
      </ThemeProvider>
  );
}

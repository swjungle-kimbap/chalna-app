import { ThemeProvider } from 'styled-components/native';
import { GestureHandlerRootView} from "react-native-gesture-handler";
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';
import { RecoilRoot } from 'recoil';
import React from 'react';
export default function App() {
  return (
      <GestureHandlerRootView>
          <ThemeProvider theme={FontTheme}>
            <RecoilRoot>
              <MainScreen />
            </RecoilRoot>
          </ThemeProvider>
      </GestureHandlerRootView>
  );
}

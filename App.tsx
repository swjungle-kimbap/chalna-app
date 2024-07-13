import { ThemeProvider } from 'styled-components/native';
import { GestureHandlerRootView} from "react-native-gesture-handler";
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';
import { RecoilRoot } from 'recoil';
import React from 'react';
import { ModalProvider } from './src/context/ModalContext'; 
import BackgroundNonDismissibleModal from './src/components/common/AlertBackgroundNonDismissbleModal'; 
export default function App() {
  return (
      <GestureHandlerRootView>
          <ThemeProvider theme={FontTheme}>
            <RecoilRoot>
              {/* <MainScreen /> */}
                <ModalProvider>
                 <MainScreen />
                 <BackgroundNonDismissibleModal />
               </ModalProvider>
            </RecoilRoot>
          </ThemeProvider>
      </GestureHandlerRootView>
  );
}

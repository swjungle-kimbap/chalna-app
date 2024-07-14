import { ThemeProvider } from 'styled-components/native';
import { GestureHandlerRootView} from "react-native-gesture-handler";
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';
import { RecoilRoot } from 'recoil';
import React, {useEffect} from 'react';
import { ModalProvider } from './src/context/ModalContext'; 
import BackgroundNonDismissibleModal from './src/components/common/AlertBackgroundNonDismissbleModal'; 
import { setModalFunctions } from './src/context/ModalService';
import { useModal } from './src/context/ModalContext';

export default function App() {
  return (
      <GestureHandlerRootView>
          <ThemeProvider theme={FontTheme}>
            <RecoilRoot>
              {/* <MainScreen /> */}
                <ModalProvider>
                 <MainScreen />
                 <BackgroundNonDismissibleModal />
                 <ModalInitializer />
               </ModalProvider>
            </RecoilRoot>
          </ThemeProvider>
      </GestureHandlerRootView>
  );
}

  const ModalInitializer: React.FC = () => {
    const { showModal } = useModal();
  
    useEffect(() => {
      setModalFunctions(showModal);
    }, [showModal]);
  
    return null;
  }


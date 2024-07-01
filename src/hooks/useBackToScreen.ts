import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { navigate } from '../navigation/RootNavigation';
import { BackHandler } from 'react-native';

const useBackToScreen = (path: any, params?:object) => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = () => {
      navigate(path, params);
      return true;
    };
    
    const backHandlerListener = BackHandler.addEventListener(
      'hardwareBackPress',
      backHandler
    );

    return () => backHandlerListener.remove();
  }, [navigation, path, params]);
};


export default useBackToScreen;

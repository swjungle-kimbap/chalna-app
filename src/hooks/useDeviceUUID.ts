import uuid from 'react-native-uuid'
import { deleteKeychain, getKeychain, setKeychain } from '../utils/keychain';
import { useEffect } from 'react';

const useDeviceUUID = () => {
  useEffect(() => {
    const fetchAndSetDeviceUUID = async () => {
      try {
        await deleteKeychain('deviceUUID'); // test
        const deviceUUID = await getKeychain('deviceUUID');
        if (!deviceUUID) {
          const newDeviceUUID:string = uuid.v4().slice(0, -2) + '00' as string;
          await setKeychain('deviceUUID', newDeviceUUID);
        } 
      } catch (error) {
        console.error('Error fetching or setting device UUID:', error);
      }
    };

    fetchAndSetDeviceUUID();
  }, []);
};

export default useDeviceUUID;
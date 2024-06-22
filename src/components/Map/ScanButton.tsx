import React, { useState, useEffect } from 'react';
import ScanNearbyAndPost, { ScanNearbyStop } from '../../service/ScanNearbyAndPost';
import { getKeychain } from '../../utils/keychain';
import RoundBox from '../common/RoundBox';
import Button from '../../components/common/Button';
import { StyleSheet } from 'react-native';
import { EmitterSubscription } from 'react-native';

const ScanButton: React.FC = () => {
  const [onDeviceFound, setOnDeviceFound] = useState<EmitterSubscription | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceUUID, setDeviceUUID] = useState<string>('');

  useEffect(() => {
    const fetchUUID = async () => {
      const uuid = await getKeychain('deviceUUID');
      setDeviceUUID(uuid);
    };
    fetchUUID();
  }, []);


  const startScan = async () => {
    if (!isScanning) {
      const listener = await ScanNearbyAndPost(deviceUUID);
      setOnDeviceFound(listener);
      setIsScanning(true);
    }
  };

  const stopScan = () => {
    if (isScanning && onDeviceFound) {
      ScanNearbyStop(onDeviceFound);
      setOnDeviceFound(null);
      setIsScanning(false);
    }
  };

  return (
    <RoundBox width='95%' style={styles.buttonContainer}>
      <Button title={isScanning ? '스캔 중지' : '인연 만나기'} onPress={isScanning ? stopScan : startScan} />
    </RoundBox>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '75%',
    position: 'absolute',
    bottom: 65, 
    right: 10,
    zIndex: 2,
}});

export default ScanButton;
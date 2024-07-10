import RoundBox from "../common/RoundBox";
import Button from '../common/Button';
import { StyleSheet } from 'react-native';

type BleButtonProps = {
  bleON: boolean;
  bleHanddler: () => void;
}

const BleButton: React.FC<BleButtonProps> = ({bleON, bleHanddler}) => {
  return (
    <RoundBox style={styles.bleButton}>
    <Button iconSource={require('../../assets/Icons/bluetoothIcon.png')}
      imageStyle={{
        width:30,
        height:30,
        tintColor: bleON ? '#14F12A' : '#979797' 
      }}
      onPress={bleHanddler}></Button>
  </RoundBox>
  );
}

const styles = StyleSheet.create({
  bleButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
    left: 20,
    height: 40, 
    width: 40,
    borderRadius: 20, 
    paddingVertical: 2, // 상하 여백 설정
    paddingHorizontal: 3, // 좌우 여백 설정
    zIndex:3
  },
})

export default BleButton;
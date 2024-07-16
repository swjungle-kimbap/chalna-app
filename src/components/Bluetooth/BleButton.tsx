import RoundBox from "../common/RoundBox";
import Button from '../common/Button';
import { StyleSheet } from 'react-native';
import color from "../../styles/ColorTheme";

type BleButtonProps = {
  bleON: boolean;
  bleHanddler: () => void;
}

const BleButton: React.FC<BleButtonProps> = ({bleON, bleHanddler}) => {
  return (
    <RoundBox style={styles.bleButton} color={bleON ? color.colors.main : '#fff'}>
    <Button title = {bleON ? "ON": "OFF"}
      titleStyle={{
        color: bleON ? '#fff' : color.colors.sub,
        fontSize: 16,
      }} variant="main"
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
    width: 60,
    borderRadius: 20, 
    paddingVertical: 2, // 상하 여백 설정
    paddingHorizontal: 3, // 좌우 여백 설정
    zIndex:3
  },
})

export default BleButton;
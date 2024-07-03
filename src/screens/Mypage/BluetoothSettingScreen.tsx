import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { StyleSheet, View } from "react-native";
import { userMMKVStorage } from "../../utils/mmkvStorage";
import { useMMKVNumber } from "react-native-mmkv";
import { isRssiTrackingState } from "../../recoil/atoms";
import { useRecoilState } from "recoil";
import Slider from '@react-native-community/slider';
import Text from "../../components/common/Text";

const BluetoothSettingScreen: React.FC = () => {
  const [advertiseMode, setAdvertiseMode] = useMMKVNumber('bluetooth.advertiseMode', userMMKVStorage);
  const [txPowerLevel, setTxPowerLevel] = useMMKVNumber('bluetooth.txPowerLevel', userMMKVStorage);
  const [scanMode, setScanMode] = useMMKVNumber('bluetooth.scanMode', userMMKVStorage);
  const [numberOfMatches, setNumberOfMatches] = useMMKVNumber('bluetooth.numberOfMatches', userMMKVStorage);
  const [isRssiTracking, setIsRssiTracking] = useRecoilState(isRssiTrackingState);

  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <View style={styles.advertisestyle}>
          <Text style={{marginBottom: 10}}>커질수록 성능이 좋아지며 배터리 소모가 커집니다.</Text>
          <InlineButton text="전파 빈도 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={0}
              maximumValue={2}
              step={1}
              value={advertiseMode}
              onValueChange={value => setAdvertiseMode(value)}
              tapToSeek
              StepMarker={({stepMarked}) => {
                return stepMarked && (
                  <Text>{advertiseMode}</Text>
                );
              }}
              minimumTrackTintColor="#3EB297"
              maximumTrackTintColor="#000000"
            />
          </InlineButton>
          <InlineButton text="전파 세기 설정" textstyle={{paddingTop: 3}} horizon='bottom'>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={0}
              maximumValue={3}
              step={1}
              value={txPowerLevel}
              onValueChange={value => setTxPowerLevel(value)}
              tapToSeek
              StepMarker={({stepMarked}) => {
                return stepMarked && (
                  <Text>{txPowerLevel}</Text>
                );
              }}
              minimumTrackTintColor="#3EB297"
              maximumTrackTintColor="#000000"
            />
          </InlineButton>
        </View>
        <View style={styles.scanstyle}>
          <InlineButton text="탐지 빈도 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={0}
              maximumValue={2}
              step={1}
              value={scanMode}
              onValueChange={value => setScanMode(value)}
              tapToSeek
              StepMarker={({stepMarked}) => {
                return stepMarked && (
                  <Text>{scanMode}</Text>
                );
              }}
              minimumTrackTintColor="#3EB297"
              maximumTrackTintColor="#000000"
            />
          </InlineButton>
          <InlineButton text="탐지 개수 설정" textstyle={{paddingTop: 3}} horizon='bottom'>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={0}
              maximumValue={2}
              step={1}
              value={numberOfMatches}
              onValueChange={value => setNumberOfMatches(value+1)}
              tapToSeek
              StepMarker={({stepMarked}) => {
                return stepMarked && (
                  <Text>{numberOfMatches}</Text>
                );
              }}
              minimumTrackTintColor="#3EB297"
              maximumTrackTintColor="#000000"
            />
          </InlineButton>
        </View>
        <InlineButton text="rssi 값 보기" textstyle={{paddingTop: 10}} horizon='none'>
          <Toggle value={isRssiTracking} toggleHandler={()=> setIsRssiTracking(isRssiTracking)} /> 
        </InlineButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mypage: {
    width: "90%",
    height: "90%",
    alignSelf: 'center', 
    paddingTop: 20,
  },
  background: {
    backgroundColor: "#fff",
    flex: 1,
  },
  otherimagePos: {
    paddingTop:14,
    paddingRight:17
  },
  advertisestyle: {
    justifyContent:"space-evenly",
    height:200
  },
  scanstyle: {
    justifyContent:"space-evenly",
    height:140
  },
});

export default BluetoothSettingScreen;

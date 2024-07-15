import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { StyleSheet, View } from "react-native";
import { userMMKVStorage } from "../../utils/mmkvStorage";
import { useMMKVNumber } from "react-native-mmkv";
import { DeveloperModeState, isRssiTrackingState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import Slider from '@react-native-community/slider';
import Text from "../../components/common/Text";
import Button from "../../components/common/Button";
import color from "../../styles/ColorTheme";

const BluetoothSettingScreen: React.FC = () => {
  const [advertiseMode, setAdvertiseMode] = useMMKVNumber('bluetooth.advertiseMode', userMMKVStorage);
  const [txPowerLevel, setTxPowerLevel] = useMMKVNumber('bluetooth.txPowerLevel', userMMKVStorage);
  const [scanMode, setScanMode] = useMMKVNumber('bluetooth.scanMode', userMMKVStorage);
  const [numberOfMatches, setNumberOfMatches] = useMMKVNumber('bluetooth.numberOfMatches', userMMKVStorage);
  const [RSSIvalue, setRSSIvalue] = useMMKVNumber('bluetooth.rssivalue', userMMKVStorage);
  const [isRssiTracking, setIsRssiTracking] = useRecoilState(isRssiTrackingState);
  const developMode = useRecoilValue(DeveloperModeState);

  const setDefaultSetting = () => {
    setAdvertiseMode(1);
    setTxPowerLevel(2);
    setScanMode(2);
    setNumberOfMatches(2);
    setRSSIvalue(-100);
    setIsRssiTracking(false);
  }

  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <Text style={{marginBottom: 10}}>커질수록 성능이 좋아지며 배터리 소모가 커집니다.</Text>
        <View  style= {styles.defaultButton}>
          <Button variant ="sub" title="기본값" onPress={setDefaultSetting}/> 
        </View>
        <View style={styles.advertisestyle}>
          
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
              minimumTrackTintColor={color.colors.main}
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
              minimumTrackTintColor={color.colors.main}
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
              minimumTrackTintColor={color.colors.main}
              maximumTrackTintColor="#000000"
            />
          </InlineButton>
          <InlineButton text="탐지 댓수 설정" textstyle={{paddingTop: 3}} horizon='bottom'>
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
              minimumTrackTintColor={color.colors.main}
              maximumTrackTintColor="#000000"
            />
          </InlineButton>
        </View>
        { developMode && (
          <>
          <Text>RSSI 값이 높아지면 탐지 하는 범위가 줄어듭니다.</Text>
          <InlineButton text="RSSI 보기" textstyle={{paddingVertical: 20}} horizon='none'>
            <Toggle value={isRssiTracking} toggleHandler={(value)=> setIsRssiTracking(value)} /> 
          </InlineButton>
          {isRssiTracking && (
            <InlineButton text="RSSI value" textstyle={{paddingTop: 3}} horizon='bottom'>
              <Slider
                style={{ width: 200, height: 40 }}
                minimumValue={-100}
                maximumValue={-60}
                step={5}
                value={RSSIvalue}
                onValueChange={value => setRSSIvalue(value)}
                tapToSeek
                minimumTrackTintColor={color.colors.main}
                maximumTrackTintColor="#000000"
              />
              <Text>{RSSIvalue}</Text>
            </InlineButton>
          )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultButton: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
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
    height:140
  },
  scanstyle: {
    justifyContent:"space-evenly",
    height:140
  },
});

export default BluetoothSettingScreen;

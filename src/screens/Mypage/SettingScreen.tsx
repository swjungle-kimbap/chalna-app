import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { Image, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { getAsyncObject } from "../../utils/asyncStorage";
import { SavedMypageData } from "../../interfaces";
import { useRecoilState } from "recoil";
import { isDisturbState, isKeywordAlarmState } from "../../recoil/atoms";
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";

type SettingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '키워드 알림 설정' | '방해금지 시간 설정'>
};

const MoveButtonUrl ='../../assets/buttons/MoveButton.png'

const SettingScreen: React.FC<SettingScreenProps> = ({navigation}) => {
  const [isAlarm, setIsAlarm] = useState(false);
  const [isFriendAlarm, setIsFriendAlarm] = useState(false);
  const [isMatchAlarm, setIsMatchAlarm] = useState(false);
  const [isKeywordAlarm, setIsKeywordAlarm] = useRecoilState(isKeywordAlarmState);
  const [alarmSound, setAlarmSound] = useState(false);
  const [alarmVibration, setAlarmVibration] = useState(false);
  const [isDisturb, setIsDisturb] = useRecoilState(isDisturbState);
  const [isdisable, setIsdisable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const savedMypageData =  await getAsyncObject<SavedMypageData>("savedMypageData")
      if (savedMypageData) {
        if (savedMypageData.isAlarm) setIsAlarm(true);
        if (savedMypageData.isFriendAlarm) setIsFriendAlarm(true);
        if (savedMypageData.isMatchAlarm) setIsMatchAlarm(true);
        if (savedMypageData.isKeywordAlarm) setIsKeywordAlarm(true);
        if (savedMypageData.alarmSound) setAlarmSound(true);
        if (savedMypageData.alarmVibration) setAlarmVibration(true);
        if (savedMypageData.isDisturb) setIsDisturb(true);
      }

      if (!isAlarm) 
        setIsdisable(true);
    }
    fetchData();
  }, []);

  useChangeBackgroundSave<SavedMypageData>('savedMypageData', {
    isAlarm, isFriendAlarm, isMatchAlarm, isKeywordAlarm, alarmSound, alarmVibration, isDisturb
  })

  const handleAlarmToggle = (value) => {
    setIsAlarm(value);
    if (value) setIsdisable(false);
    else setIsdisable(true);
  }

  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <InlineButton text="알림 설정" textstyle={{paddingTop: 10}} horizon='bottom'>
          <Toggle value={isAlarm} toggleHandler={handleAlarmToggle} /> 
        </InlineButton>
        <View style={styles.inlineButtons}>
          <InlineButton text="친구 알림 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Toggle isdisable={isdisable} value={isFriendAlarm} toggleHandler={(value)=>setIsFriendAlarm(value)} /> 
          </InlineButton>
          <InlineButton text="인연 알림 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Toggle isdisable={isdisable} value={isMatchAlarm} toggleHandler={(value)=>setIsMatchAlarm(value)} /> 
          </InlineButton>
          <InlineButton text="인연 키워드 설정" textstyle={{paddingTop: 3}} horizon='bottom'
            onPressfunc={()=>navigation.navigate('키워드 알림 설정')} isdisable={isdisable}>
            <View style={styles.imagePos} >
              <Image source={require(MoveButtonUrl)} />
            </View>
          </InlineButton>
        </View>
        <View style={styles.alaramButtons}>
          <InlineButton text="알림 소리 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Toggle isdisable={isdisable} value={alarmSound} toggleHandler={(value)=>setAlarmSound(value)} /> 
          </InlineButton>
          <InlineButton text="알림 진동 설정" textstyle={{paddingTop: 3}} horizon='bottom'>
            <Toggle isdisable={isdisable} value={alarmVibration} toggleHandler={(value)=>setAlarmVibration(value)} /> 
          </InlineButton>
        </View>
        <InlineButton text="방해금지 시간 설정" textstyle={{paddingTop: 10}} horizon='none'
          onPressfunc={()=>navigation.navigate('방해금지 시간 설정')} isdisable={isdisable}>
          <View style={styles.otherimagePos} >
            <Image source={require(MoveButtonUrl)} />
          </View>
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
  imagePos: {
    paddingTop:8,
    paddingRight:17
  },
  otherimagePos: {
    paddingTop:14,
    paddingRight:17
  },
  inlineButtons: {
    justifyContent:"space-evenly",
    height:150
  },
  alaramButtons: {
    justifyContent:"space-between",
    height:90
  }
});

export default SettingScreen;

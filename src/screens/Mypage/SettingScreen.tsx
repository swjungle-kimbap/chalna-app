import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { Image, StyleSheet, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { getAsyncObject, setAsyncObject } from "../../utils/asyncStorage";
import { SavedMypageData } from "../../interfaces";
import { useRecoilState } from "recoil";
import { isDisturbState, isKeywordAlarmState } from "../../recoil/atoms";
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import { useFocusEffect } from "@react-navigation/core";
import { axiosPatch } from "../../axios/axios.method";
import { urls } from "../../axios/config";

type SettingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '키워드 알림 설정' | '방해금지 시간 설정'>
};

const MoveButtonUrl ='../../assets/buttons/MoveButton.png'

const SettingScreen: React.FC<SettingScreenProps> = ({navigation}) => {
  const [isAlarm, setIsAlarm] = useState(true);
  const [isFriendAlarm, setIsFriendAlarm] = useState(true);
  const [isMatchAlarm, setIsMatchAlarm] = useState(true);
  const [isKeywordAlarm, setIsKeywordAlarm] = useRecoilState(isKeywordAlarmState);
  const [alarmSound, setAlarmSound] = useState(true);
  const [alarmVibration, setAlarmVibration] = useState(true);
  const [isDisturb, setIsDisturb] = useRecoilState(isDisturbState);
  const [isdisable, setIsdisable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const savedMypageData =  await getAsyncObject<SavedMypageData>("savedMypageData")
      if (savedMypageData) {
        if (!savedMypageData.isAlarm) setIsAlarm(false);
        if (!savedMypageData.isFriendAlarm) setIsFriendAlarm(false);
        if (!savedMypageData.isMatchAlarm) setIsMatchAlarm(false);
        if (savedMypageData.isKeywordAlarm) setIsKeywordAlarm(true);
        if (!savedMypageData.alarmSound) setAlarmSound(false);
        if (!savedMypageData.alarmVibration) setAlarmVibration(false);
        if (savedMypageData.isDisturb) setIsDisturb(true);
      }
    }
    fetchData();
  }, []);

  useChangeBackgroundSave<SavedMypageData>('savedMypageData', {
    isAlarm, isFriendAlarm, isMatchAlarm, isKeywordAlarm, alarmSound, alarmVibration, isDisturb
  })

  useEffect(() => {
    if (isAlarm) 
      setIsdisable(false);
    else 
      setIsdisable(true);
  }, [isAlarm])

  useFocusEffect(
    useCallback(() => {
      return () => {
        const isAlarmData = {
          isAlarm, isFriendAlarm, isMatchAlarm, isKeywordAlarm, alarmSound, alarmVibration, isDisturb
        };
        setAsyncObject<SavedMypageData>("savedMypageData", isAlarmData);
      };
    }, [isAlarm, isFriendAlarm, isMatchAlarm, isKeywordAlarm, alarmSound, alarmVibration, isDisturb])
  );

  const handleIsAlarm = (value) => {
    setIsAlarm(value)
    axiosPatch(urls.PATCH_APP_SETTING_URL, "앱 설정", {isAlarm: value});
  }

  const handleIsFriendAlarm = (value) => {
    setIsFriendAlarm(value)
    axiosPatch(urls.PATCH_APP_SETTING_URL, "앱 설정", {isFriendAlarm: value});
  }

  const handleIsMatchAlarm = (value) => {
    setIsMatchAlarm(value)
    axiosPatch(urls.PATCH_APP_SETTING_URL, "앱 설정", {isMatchAlarm: value});
  }

  const handleAlarmSound = (value) => {
    setAlarmSound(value)
    axiosPatch(urls.PATCH_APP_SETTING_URL, "앱 설정", {AlarmSound: value});
  }
  
  const handleAlarmVibration = (value) => {
    setAlarmVibration(value)
    axiosPatch(urls.PATCH_APP_SETTING_URL, "앱 설정", {AlarmVibratio: value});
  }

  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <InlineButton text="알림 설정" textstyle={{paddingTop: 10}} horizon='bottom'>
          <Toggle value={isAlarm} toggleHandler={handleIsAlarm} /> 
        </InlineButton>
        <View style={styles.inlineButtons}>
          <InlineButton text="친구 알림 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Toggle isdisable={isdisable} value={isFriendAlarm} toggleHandler={handleIsFriendAlarm} /> 
          </InlineButton>
          <InlineButton text="인연 알림 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Toggle isdisable={isdisable} value={isMatchAlarm} toggleHandler={handleIsMatchAlarm} /> 
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
            <Toggle isdisable={isdisable} value={alarmSound} toggleHandler={handleAlarmSound} /> 
          </InlineButton>
          <InlineButton text="알림 진동 설정" textstyle={{paddingTop: 3}} horizon='bottom'>
            <Toggle isdisable={isdisable} value={alarmVibration} toggleHandler={handleAlarmVibration} /> 
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

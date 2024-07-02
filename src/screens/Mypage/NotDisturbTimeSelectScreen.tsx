import { View, StyleSheet, Text } from "react-native";
import FontTheme from '../../styles/FontTheme';
import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-native-date-picker";
import HorizontalLine from "../../components/Mypage/HorizontalLine";
import { useRecoilState} from "recoil";
import { isDisturbState } from "../../recoil/atoms";
import { getAsyncObject, setAsyncObject } from "../../utils/asyncStorage";
import { SavedDisturbTime } from "../../interfaces";
import Button from "../../components/common/Button"
import { axiosPatch } from "../../axios/axios.method";
import { urls } from "../../axios/config";

const NotDisturbTimeSelectScreen = () => {
  const [isDisturb, setIsDisturb] = useRecoilState<boolean>(isDisturbState);
  const startDateRef = useRef(new Date());
  const endDateRef = useRef(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const savedDisturbTime = await getAsyncObject<SavedDisturbTime>("savedDisturbTime");
      if (savedDisturbTime) {
        const [startHour, startMinute] = savedDisturbTime.doNotDisturbStart.split(':').map(Number);
        const [endHour, endMinute] = savedDisturbTime.doNotDisturbEnd.split(':').map(Number);

        const today = new Date();
        const startDate = new Date(today);
        startDate.setHours(startHour, startMinute, 0, 0);

        const endDate = new Date(today);
        endDate.setHours(endHour, endMinute, 0, 0);

        setStartDate(startDate);
        setEndDate(endDate);
      }
    }
    fetchData();
  }, []);

  const handleIsDisturb = (value) => {
    setIsDisturb(value)
    axiosPatch(urls.PATCH_APP_SETTING_URL, "앱 설정", {isDisturb: value});
  }
  const padZero = (num) => {
    return num < 10 ? `0${num}` : num;
  };
  

  const handleSaveDisturbTime = () => {
    const nonDisturbTime = {
      doNotDisturbStart: `${padZero(startDateRef.current.getHours())}:${padZero(startDateRef.current.getMinutes())}`, 
      doNotDisturbEnd: `${padZero(endDateRef.current.getHours())}:${padZero(endDateRef.current.getMinutes())}`,
    };
    setAsyncObject<SavedDisturbTime>("savedDisturbTime", nonDisturbTime);
    axiosPatch(urls.DISTURB_ALARM_URL, "방해금지 시간 설정", nonDisturbTime);
  }
  
  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <InlineButton text="방해금지 시간 설정" textstyle={{paddingTop: 10}} horizon='bottom'>
          <Toggle value={isDisturb} toggleHandler={handleIsDisturb} /> 
        </InlineButton>
        {isDisturb && (
          <>
            <Text style={styles.text}>방해금지 시작 시각과 종료 시각을 설정해주세요</Text>
            <View style={styles.datePickerContainer}>
              <Text style={styles.Timetext}>시작</Text>
              <DatePicker date={startDate} onDateChange={(value)=>{startDateRef.current = value}} 
                mode="time" theme="light" minuteInterval={15}/>
            </View>
            <HorizontalLine/>
            <View style={styles.datePickerContainer}>
              <Text style={styles.Timetext}>종료</Text>
              <DatePicker date={endDate} onDateChange={(value) => {endDateRef.current = value}} 
                mode="time" theme="light" minuteInterval={15}/>
            </View>
            <Button title="저장하기" titleStyle={styles.saveButton} onPress={handleSaveDisturbTime}/>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    fontSize: 16,
    paddingTop: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:'center',
  },
  mypage: {
    width: "90%",
    alignSelf: 'center', 
    paddingTop: 20,
  },
  background: {
    backgroundColor: "#fff",
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: '#000',
    fontFamily: FontTheme.fonts.main,
    paddingVertical: 7,
  },
  Timetext: {
    fontSize: 15,
    color: '#000',
    fontFamily: FontTheme.fonts.main,
  }
});


export default NotDisturbTimeSelectScreen;
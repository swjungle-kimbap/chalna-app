import { View, StyleSheet, Text } from "react-native";
import FontTheme from '../../styles/FontTheme';
import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { useState } from "react";
import DatePicker from "react-native-date-picker";
import HorizontalLine from "../../components/Mypage/HorizontalLine";

const NotDisturbTimeSelectScreen = () => {
  const [isDisturb, setIsDisturb] = useState<boolean>(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <InlineButton text="방해금지 제외 시간 설정" textstyle={{paddingTop: 10}} horizon='bottom'>
          <Toggle value={isDisturb} toggleHandler={(value)=>setIsDisturb(value)} /> 
        </InlineButton>
        {isDisturb && (
          <>
            <Text style={styles.text}>알람 받기를 희망하는 시간대를 설정해주세요</Text>
            <View style={styles.datePickerContainer}>
              <Text style={styles.Timetext}>시작 시간</Text>
              <DatePicker date={startDate} onDateChange={setStartDate} mode="time" theme="light" minuteInterval={15}/>
            </View>
            <HorizontalLine/>
            <View style={styles.datePickerContainer}>
              <Text style={styles.Timetext}>종료 시간</Text>
              <DatePicker date={endDate} onDateChange={setEndDate} mode="time" theme="light" minuteInterval={15}/>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
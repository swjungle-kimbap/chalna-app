import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { Image, StyleSheet, View } from "react-native";


type SettingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '키워드 알림 설정' | '방해금지 시간 설정'>
};

const MoveButtonUrl ='../../assets/buttons/MoveButton.png'

const SettingScreen: React.FC<SettingScreenProps> = ({navigation}) => {

  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <InlineButton text="알림 설정" textstyle={{paddingTop: 10}} horizon='bottom'>
          <Toggle value={false} toggleHandler={()=>{}} /> 
        </InlineButton>
        <View style={styles.inlineButtons}>
          <InlineButton text="친구 알림 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Toggle value={false} toggleHandler={()=>{}} /> 
          </InlineButton>
          <InlineButton text="인연 알림 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Toggle value={false} toggleHandler={()=>{}} /> 
          </InlineButton>
          <InlineButton text="인연 키워드 설정" textstyle={{paddingTop: 3}} horizon='bottom'
            onPressfunc={()=>navigation.navigate('키워드 알림 설정')}>
            <View style={styles.imagePos} >
              <Image source={require(MoveButtonUrl)} />
            </View>
          </InlineButton>
        </View>
        <View style={styles.alaramButtons}>
          <InlineButton text="알림 소리 설정" textstyle={{paddingTop: 3}} horizon='none'>
            <Toggle value={false} toggleHandler={()=>{}} /> 
          </InlineButton>
          <InlineButton text="알림 진동 설정" textstyle={{paddingTop: 3}} horizon='bottom'>
            <Toggle value={false} toggleHandler={()=>{}} /> 
          </InlineButton>
        </View>
        <InlineButton text="방해금지 시간 설정" textstyle={{paddingTop: 10}} horizon='none'
          onPressfunc={()=>navigation.navigate('방해금지 시간 설정')}>
          <View style={styles.imagePos} >
            <Image source={require(MoveButtonUrl)} />
          </View>
        </InlineButton>
      </View>
    </View>
  )
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
    paddingTop:10,
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

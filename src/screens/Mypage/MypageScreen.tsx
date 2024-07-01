import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import { StyleSheet, View } from "react-native";
import InlineButton from "../../components/Mypage/InlineButton";
import UserCard from "../../components/Mypage/UserCard";
import { logoutAlert } from "../../service/Setting";

type MypageScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '앱 설정'>
};

const MoveButtonUrl ='../../assets/buttons/MoveButton.png'

const MypageScreen: React.FC<MypageScreenProps> = ({navigation}) => {
  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <UserCard />
        <InlineButton onPressfunc={() => navigation.navigate('앱 설정')} 
          imgSource={require(MoveButtonUrl)}>앱 설정</InlineButton>
        <InlineButton onPressfunc={logoutAlert}>로그 아웃</InlineButton>
        <InlineButton onPressfunc={()=>{}} textstyle={{color:"#979797"}}>계정 탈퇴</InlineButton> 
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mypage: {
    width: "90%",
    alignSelf: 'center', 
  },
  background: {
    backgroundColor: "#fff",
    flex: 1,
  },
});
export default MypageScreen;

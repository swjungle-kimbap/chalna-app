import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import { Image, StyleSheet, View } from "react-native";
import InlineButton from "../../components/Mypage/InlineButton";
import UserCard from "../../components/Mypage/UserCard";
import { useLogoutAndWithdrawal } from "../../service/Setting";

type MypageScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '앱 설정'>
};

const MoveButtonUrl ='../../assets/buttons/MoveButton.png'

const MypageScreen: React.FC<MypageScreenProps> = ({navigation}) => {
  const { logoutAlert, withdrawalAlert } = useLogoutAndWithdrawal();
  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <UserCard />
        <InlineButton onPressfunc={() => navigation.navigate('앱 설정')} 
          text="앱 설정" textstyle={styles.textPos}>
          <View style={styles.imagePos} >
            <Image source={require(MoveButtonUrl)} />
          </View>
        </InlineButton>
        <InlineButton onPressfunc={logoutAlert} textstyle={styles.textPos} text="로그 아웃"/>
        <InlineButton onPressfunc={withdrawalAlert} textstyle={{paddingTop:2, color:"#979797"}} text="계정 탈퇴"/>
      </View>
    </View>
  );
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
  imagePos: {
    paddingTop:5,
    paddingRight:17
  },
  textPos: {
    paddingTop:2,
  },
});
export default MypageScreen;

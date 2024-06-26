import styled from "styled-components/native";
import Text from "../../components/common/Text";
import Button from "../../components/common/Button"
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import RoundBox from "../../components/common/RoundBox";
import { Alert } from "react-native";
import Config from "react-native-config";
import { AxiosResponse, LogoutResponse } from "../../interfaces";
import { axiosPost } from "../../axios/axios.method";
import { navigate } from "../../navigation/RootNavigation";
import { deleteKeychain } from "../../utils/keychain";

type MypageScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '앱 설정'>
};

const MypageScreen: React.FC<MypageScreenProps> = ({navigation}) => {
  return (
    <MypageStyle> 
      <Text>마이페이지 입니다</Text>
      <Button title="설정 페이지" onPress={()=>navigation.navigate('앱 설정')}/>
      <RoundBox color="#FFFFFF">
        <Text>내용</Text>
      </RoundBox>
      <RoundBox color="#FFFFFF">
        <Button title='로그아웃' onPress={() => {
          Alert.alert("로그아웃", "로그아웃 하시겠습니까?",
            [
              {
                text: '나가기',
                onPress: async () => {
                  try {
                    await axiosPost<AxiosResponse<LogoutResponse>>(Config.LOGOUT_URL);
                    deleteKeychain("loginToken");
                    deleteKeychain("accessToken");
                    deleteKeychain("refreshToken");
                    navigate("로그인")                    
                  } catch (e) {
                    console.error("로그 아웃 중 오류 발생:", e);
                  };
                },
                style: 'default'
              },
            ],
            {
              cancelable: true,
            },
          )
        }}/>
      </RoundBox>
    </MypageStyle>
  )
}

const MypageStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default MypageScreen;

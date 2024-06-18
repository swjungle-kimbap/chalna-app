import styled from "styled-components/native";
import Text from "../../components/common/Text";

const LoginScreen: React.FC = ({}) => {
  return (
    <LoginStyle> 
      <Text>Login page</Text>
    </LoginStyle>
  )
}

const LoginStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default LoginScreen;

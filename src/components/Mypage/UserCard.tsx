import FontTheme from '../../styles/FontTheme';
import Button from "../../components/common/Button"
import { StyleSheet, View, Text  } from "react-native";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../recoil/atoms";

const DefaultImgUrl = '../../assets/images/anonymous.png';
const editButtonUrl ='../../assets/buttons/EditButton.png'

const UserCard = () => {
  const user = useRecoilValue(userInfoState);

  return (
    <View style={styles.myProfileContainer}>
    <View style={styles.headerText}>
      <Text style={styles.text}>내 프로필</Text>
    </View>
    <View style={styles.header}>
      <Button 
        iconSource={user.profileImageUrl ? require(DefaultImgUrl) : require(DefaultImgUrl)} 
        imageStyle={styles.avatar} 
      />
      <View>
        <View style={styles.username}>
          <Text style={styles.text}>{user.username}</Text>
          <Button iconSource={require(editButtonUrl)}/>
        </View>
        <View style={styles.username}>
          <Text 
            style={[
              styles.statusMessage,
              { color: user.message ? '#fff' : '#979797' } 
            ]}
          >
            {user.message ? "user.message" : "상태 메세지를 입력해주세요"}
          </Text>
          <Button iconSource={require(editButtonUrl)}/>
        </View>
      </View>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  username: {
    flexDirection: 'row',
  },
  headerText: {
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  myProfileContainer: {
    textAlign: 'left',
    height: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 25,
    marginRight: 15,
    resizeMode: "contain"
  },
  text: {
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
    fontFamily:FontTheme.fonts.main, 
    paddingRight: 7,
  },
  statusMessage: {
    fontSize: 15,
    color: '#979797',
    fontFamily: FontTheme.fonts.sub, 
    paddingRight: 6,
  },
});

export default UserCard;
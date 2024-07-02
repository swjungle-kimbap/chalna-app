import FontTheme from '../../styles/FontTheme';
import Button from "../../components/common/Button"
import { StyleSheet, View, Text  } from "react-native";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../recoil/atoms";
import { useState } from 'react';
import EditModal from './EditModal';

const DefaultImgUrl = '../../assets/images/anonymous.png';
const editButtonUrl ='../../assets/buttons/EditButton.png'

const UserCard = () => {
  const user = useRecoilValue(userInfoState);
  const [username, setUsername] = useState(user.username);
  const [statusMessage, setStatusMessage] = useState(user.message ? user.message : "상태 메세지를 입력해주세요");
  const [showNameEditModal, setShowNameEditModal] = useState<boolean>(false);
  const [showStatusEditModal, setShowStatusEditModal] = useState<boolean>(false);

  return (
  <>
    {showNameEditModal && (<EditModal setValue={setUsername} value={username} maxLength={10}
      modalVisible={showNameEditModal}  closeModal={() => setShowNameEditModal(false)}/>)}
    {showStatusEditModal && (<EditModal value={statusMessage}  setValue={setStatusMessage} maxLength={20}
      modalVisible={showStatusEditModal} closeModal={() => setShowStatusEditModal(false)}/>)}
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
            <Text style={styles.text}>{username}</Text>
            <Button iconSource={require(editButtonUrl)} 
              onPress={() => setShowNameEditModal(true)}/>
          </View>
          <View style={styles.username}>
            <Text 
              style={[
                styles.statusMessage,
                { color: user.message ? '#fff' : '#979797' } 
              ]}>
              {statusMessage}
            </Text>
            <Button iconSource={require(editButtonUrl)} 
              onPress={() => setShowStatusEditModal(true)}/>
          </View>
        </View>
      </View>
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  username: {
    flexDirection: 'row',
    width:250,
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
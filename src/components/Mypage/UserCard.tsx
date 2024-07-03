import FontTheme from '../../styles/FontTheme';
import Button from "../../components/common/Button"
import { StyleSheet, View, Text  } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { userInfoState } from "../../recoil/atoms";
import { useState } from 'react';
import EditModal from './EditModal';
import { LoginResponse } from '../../interfaces';
import { axiosPatch } from '../../axios/axios.method';
import { urls } from '../../axios/config';
import { setAsyncObject } from '../../utils/asyncStorage';

const DefaultImgUrl = '../../assets/images/anonymous.png';
const editButtonUrl ='../../assets/buttons/EditButton.png'

const UserCard = () => {
  const [userInfo, setUserInfo] = useRecoilState<LoginResponse>(userInfoState);
  const [showNameEditModal, setShowNameEditModal] = useState<boolean>(false);
  const [showStatusEditModal, setShowStatusEditModal] = useState<boolean>(false);

  const setUsername = (username) => {
    const newUseInfo = {...userInfo, username};
    setUserInfo(newUseInfo);
    axiosPatch(urls.USER_INFO_EDIT_URL, "사용자 정보 수정", newUseInfo);
    setAsyncObject<LoginResponse>("userInfo", newUseInfo);
  }
  const setMessage = async (message) => {
    const newUseInfo = {...userInfo, message};
    setUserInfo(newUseInfo);
    axiosPatch(urls.USER_INFO_EDIT_URL, "사용자 정보 수정", newUseInfo);
    setAsyncObject<LoginResponse>("userInfo", newUseInfo);
  }

  return (
  <>
    {showNameEditModal && (<EditModal value={userInfo.username} setValue={setUsername} maxLength={10}
      modalVisible={showNameEditModal}  closeModal={() => setShowNameEditModal(false)}/>)}
    {showStatusEditModal && (<EditModal value={userInfo.message} setValue={setMessage} maxLength={20}
      modalVisible={showStatusEditModal} closeModal={() => setShowStatusEditModal(false)}/>)}
    <View style={styles.myProfileContainer}>
      <View style={styles.headerText}>
        <Text style={styles.text}>내 프로필</Text>
      </View>
      <View style={styles.header}>
        <Button 
          iconSource={userInfo.profileImageUrl ? require(DefaultImgUrl) : require(DefaultImgUrl)} 
          imageStyle={styles.avatar} 
        />
        <View>
          <View style={styles.username}>
            <Text style={styles.text}>{userInfo.username}</Text>
            <Button iconSource={require(editButtonUrl)} 
              onPress={() => setShowNameEditModal(true)}/>
          </View>
          <View style={styles.username}>
            <Text 
              style={[
                styles.statusMessage,
              ]}>
              {userInfo.message ? userInfo.message : "상태 메세지를 입력해주세요"}
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
    fontSize: 14,
    color: '#979797',
    fontFamily: FontTheme.fonts.sub, 
    paddingRight: 6,
  },
});

export default UserCard;
import FontTheme from '../../styles/FontTheme';
import Button from "../../components/common/Button"
import { StyleSheet, View, Text , Modal, TouchableOpacity, Image } from "react-native";
import { useRecoilState } from "recoil";
import { userInfoState } from "../../recoil/atoms";
import { useEffect, useState } from 'react';
import EditModal from './EditModal';
import { LoginResponse } from '../../interfaces';
import { axiosPatch } from '../../axios/axios.method';
import { urls } from '../../axios/config';
import { getMMKVString, setMMKVObject } from '../../utils/mmkvStorage';
import FastImage, { Source } from 'react-native-fast-image';
import { handleImagePicker, uploadImage,  } from '../../utils/FileHandling';

const DefaultImgUrl = '../../assets/images/anonymous.png';
const editButtonUrl ='../../assets/buttons/EditButton.png'
const photoIconUrl = '../../assets/Icons/PhotoIcon.png'; // 사진 아이콘


const UserCard = () => {
  const [userInfo, setUserInfo] = useRecoilState<LoginResponse>(userInfoState);
  const [showNameEditModal, setShowNameEditModal] = useState<boolean>(false);
  const [showStatusEditModal, setShowStatusEditModal] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [profileUri, setProfileUri] = useState("");

  useEffect(() => {
    const savedUri = getMMKVString(`image.${userInfo.profileImageId}`);
    if (savedUri)
      setProfileUri(savedUri);
  }, [])

  const updateUserInfo = (userData) => {
    const newUseInfo = {...userInfo, ...userData};
    setUserInfo(newUseInfo);
    axiosPatch(urls.PATCH_USER_INFO_URL, "사용자 정보 수정", userData);
    setMMKVObject<LoginResponse>("mypage.userInfo", newUseInfo);
  }
  
  const handleImagePick = async () => {
    const image = await handleImagePicker();
    const {uri, fileId} = await uploadImage(image, "PROFILEIMAGE");
    setProfileUri(uri);
    updateUserInfo({profileImageId:fileId});
  }

  const resetDefaultImg = async () => {
    setProfileUri("");
    setModalVisible(false);
    updateUserInfo({profileImageId:0});
  }

  return (
  <>
    {showNameEditModal && (<EditModal value={userInfo.username} 
      setValue={(username) => updateUserInfo({username})} maxLength={10}
        modalVisible={showNameEditModal}  closeModal={() => setShowNameEditModal(false)}/>)}
    {showStatusEditModal && (<EditModal value={userInfo.message} 
      setValue={(message) => updateUserInfo({message})} maxLength={20}
        modalVisible={showStatusEditModal} closeModal={() => setShowStatusEditModal(false)}/>)}
    <View style={styles.myProfileContainer}>
      <View style={styles.headerText}>
        <Text style={styles.text}>내 프로필</Text>    
      </View>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profileUri ? (            
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <FastImage
              style={styles.avatar}
              source={{uri: profileUri}}
              resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
            ): (
            <>
              <Button iconSource={require(DefaultImgUrl)} onPress={handleImagePick} imageStyle={styles.avatar} /> 
              <Button
              iconSource={require(photoIconUrl)}
              imageStyle={styles.photoIcon}
              onPress={handleImagePick}
              />
          </>)}
          </View>
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
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
      > 
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FastImage
            style={styles.fullScreenImage}
            source={{ uri: profileUri, priority: FastImage.priority.normal }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="다른 이미지 선택" onPress={handleImagePick} titleStyle={styles.Button} />
          <Button title="기본 이미지로 변경" onPress={resetDefaultImg} titleStyle={styles.Button} />
        </View>
        <Button title="닫기" onPress={() => setModalVisible(false)} titleStyle={styles.closeButton} />
      </View>
    </Modal>
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
  photoIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',  
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: 300,
  },
  closeButton: {
    fontSize: 15,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-evenly'
  },
  Button:{
    fontSize: 15,
    color: '#fff',
    padding: 20,
  },
});

export default UserCard;
import FontTheme from '../../styles/FontTheme';
import Button from "../../components/common/Button"
import { StyleSheet, View, Text , Modal, TouchableOpacity, Alert} from "react-native";
import { useRecoilState } from "recoil";
import { userInfoState } from "../../recoil/atoms";
import { useRef, useState } from 'react';
import EditModal from './EditModal';
import { LoginResponse } from '../../interfaces';
import { axiosPatch } from '../../axios/axios.method';
import { urls } from '../../axios/config';
import { setMMKVObject } from '../../utils/mmkvStorage';
import FastImage, { Source } from 'react-native-fast-image';
import { handleImagePicker, handleUploadS3 } from '../../service/FileHandling';
import RNFS from 'react-native-fs';

const DefaultImgUrl = '../../assets/images/anonymous.png';
const editButtonUrl ='../../assets/buttons/EditButton.png'
const photoIconUrl = '../../assets/Icons/PhotoIcon.png'; // 사진 아이콘


const UserCard = () => {
  const [userInfo, setUserInfo] = useRecoilState<LoginResponse>(userInfoState);
  const [showNameEditModal, setShowNameEditModal] = useState<boolean>(false);
  const [showStatusEditModal, setShowStatusEditModal] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const ImageRef = useRef(null);

  const setUsername = (username) => {
    const newUseInfo = {...userInfo, username};
    setUserInfo(newUseInfo);
    axiosPatch(urls.USER_INFO_EDIT_URL, "사용자 정보 수정", {username});
    setMMKVObject<LoginResponse>("mypage.userInfo", newUseInfo);
  }
  const setMessage = async (message) => {
    const newUseInfo = {...userInfo, message};
    setUserInfo(newUseInfo);
    axiosPatch(urls.USER_INFO_EDIT_URL, "사용자 정보 수정", {message});
    setMMKVObject<LoginResponse>("mypage.userInfo", newUseInfo);
  }

  const downloadAndStoreImage = async (url) => {
    try {
      const timestamp = new Date().getTime();
      const localFilePath = `${RNFS.DocumentDirectoryPath}/profile_image_${timestamp}.jpg`; // 앱 내부 저장소 
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url, 
        toFile: localFilePath, // 로컬다운경로 
      }).promise;
      console.log(localFilePath);
  
      if (downloadResult.statusCode === 200) {                                                                 
        setUserInfo({ ...userInfo, profileImageUrl: `file://${localFilePath}` });
        axiosPatch(urls.USER_INFO_EDIT_URL, "사용자 정보 수정", { profileImageUrl: `file://${localFilePath}` });
        setMMKVObject<LoginResponse>("mypage.userInfo", { ...userInfo, profileImageUrl: `file://${localFilePath}` });
      } else {
        console.log(downloadResult.statusCode);
        Alert.alert('실패', '이미지 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Image download error: ', error);
      Alert.alert('실패', '이미지 다운로드 중 오류가 발생했습니다.');
    }
  };

  const resetToDefaultImage = () => {
    setUserInfo({ ...userInfo, profileImageUrl: DefaultImgUrl });
    axiosPatch(urls.USER_INFO_EDIT_URL, "프로필 이미지 기본으로 변경", { profileImageUrl: DefaultImgUrl });
    setMMKVObject<LoginResponse>("mypage.userInfo", { ...userInfo, profileImageUrl: DefaultImgUrl });
  };

  const handleImagePick = async () => {
    const image = await handleImagePicker();
    const {presignedUrl, fileId} = await handleUploadS3(image);
    await downloadAndStoreImage(presignedUrl);
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
        <View style={styles.avatarContainer}>
          {userInfo.profileImageUrl !== DefaultImgUrl && userInfo.profileImageUrl ? (            
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <FastImage
              style={styles.avatar}
              source={{uri: userInfo.profileImageUrl, priority: FastImage.priority.normal } as Source}
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
            source={{ uri: userInfo.profileImageUrl, priority: FastImage.priority.normal }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="다른 이미지 선택" onPress={handleImagePick} titleStyle={styles.Button} />
          <Button title="기본 이미지로 변경" onPress={() => {
            resetToDefaultImage();
            setModalVisible(false);
          }} titleStyle={styles.Button} />
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
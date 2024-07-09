import React, {useState, useCallback, useMemo} from 'react';
import { View, FlatList, TextInput, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import styled from 'styled-components/native';
import Text from '../../components/common/Text';
import FriendCard from '../../components/FriendCard';
import {StackNavigationProp} from '@react-navigation/stack';
import {Friend, RootStackParamList} from '../../interfaces';
import {axiosGet} from '../../axios/axios.method';
import {urls} from '../../axios/config';
import {useRecoilState} from 'recoil';
import {
  getKoreanInitials,
  handleDownloadProfile,
} from '../../service/Friends/FriendListAPI';
import {ProfileImageMapState, userInfoState} from '../../recoil/atoms';
import {navigate} from '../../navigation/RootNavigation';
import FontTheme from '../../styles/FontTheme';
import FastImage, { Source } from 'react-native-fast-image';
import Button from '../../components/common/Button';
import HorizontalLine from '../../components/Mypage/HorizontalLine';

interface ApiResponse {
  status: string;
  message: string;
  data: Friend[];
}

type FriendsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '친구 목록'>;
};

const DefaultImgUrl = '../../assets/images/anonymous.png';

const FriendsScreen: React.FC<FriendsScreenProps> = ({navigation}) => {
  const [friendsList, setFriendsList] = useState([]);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const [profileImageMap, setProfileImageMap] = useRecoilState(ProfileImageMapState);
  const [myprofileVisible, setMyprofileVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchFriends = async () => {
        setLoading(true);
        try {
          const response = await axiosGet<ApiResponse>(
            urls.GET_FRIEND_LIST_URL,
          );
          console.log('friend api response: ', response.data.data);
          const friends = response.data.data;
          const updatedProfileImageMap = new Map(profileImageMap);

          for (const friend of friends) {
            const profileImageUri = updatedProfileImageMap.get(
              friend.profileImageId,
            );
            if (!profileImageUri && friend.profileImageId) {
              const newProfileImageUri = await handleDownloadProfile(
                friend.profileImageId,
              );
              updatedProfileImageMap.set(
                friend.profileImageId,
                newProfileImageUri,
              );
              console.log('새로 다운받은 프로필 이미지 : ', newProfileImageUri);
            }
          }
          setProfileImageMap(updatedProfileImageMap);
          setFriendsList(friends);
        } catch (error) {
          setError('Failed to fetch friends');
          setLoading(false);
        } finally {
          setLoading(false);
        }
      };
      fetchFriends();
    }, []),
  );

  useMemo(() => {
    const trimmedQuery = searchQuery.replace(/\s+/g, '');
    if (!trimmedQuery) {
      setFilteredData(friendsList);
    } else {
      const filtered = friendsList.filter(
        ({username, message}) =>
          (username &&
            (username.includes(trimmedQuery) ||
              getKoreanInitials(username).includes(trimmedQuery))) ||
          (message &&
            (message.includes(trimmedQuery) ||
              getKoreanInitials(message).includes(trimmedQuery))),
      );
      setFilteredData(filtered);
    }
  }, [friendsList, searchQuery]);

  const handleCardPress = useCallback((cardId: number) => {
    setExpandedCardId(prevId => (prevId === cardId ? null : cardId));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderFriendCard = useCallback(
    ({item}: {item: Friend}) => (
      <FriendCard
        user={item}
        isExpanded={item.id === expandedCardId}
        onExpand={() => handleCardPress(item.id)}
        navigation={navigation}
        options={'friend'}
      />
    ),
    [expandedCardId, navigation],
  );
  const Myprofile = () => {
    return (
      <View style={styles.myProfileContainer}>
      <View style={styles.headerText}>
        <Text style={styles.text}>내 프로필</Text>
        <Button iconSource={require('../../assets/Icons/cogIcon.png')} imageStyle={styles.closebutton}
          onPress={() => navigate('로그인 성공', { screen: "친구목록", params: { screen: "마이 페이지" }})}/>
      </View>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {userInfo.profileImageUrl !== DefaultImgUrl && userInfo.profileImageUrl ? (            
            <FastImage
              style={styles.avatar}
              source={{uri: userInfo.profileImageUrl, priority: FastImage.priority.normal } as Source}
              resizeMode={FastImage.resizeMode.cover}
              />
            ): (
            <>
              <Button iconSource={require(DefaultImgUrl)} imageStyle={styles.avatar} /> 
          </>)}
          </View>
        <View>
          <View style={styles.username}>
            <Text style={styles.text}>{userInfo.username}</Text>
          </View>
          <View style={styles.username}>
            <Text style={styles.statusMessage}>{userInfo.message}</Text>
          </View>
        </View>
      </View>
    </View>
    );
  }

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  return (
    <View style={styles.friendListPage}>
      <View style={styles.ListContainer}>
        { myprofileVisible ?
          <>
          <Myprofile/>
          <HorizontalLine />
          <View style={styles.friendText}>
            <Text style={styles.text}>친구 목록</Text>
            <Button iconSource={require('../../assets/Icons/SearchIcon.png')} imageStyle={styles.searchIcon} 
            onPress={() => {
              setMyprofileVisible(false);
              setSearchQuery("");
              setFilteredData(friendsList);
            }}/>
          </View>
          </> : 
          <>
          <View style={styles.searchContainer}>
          <Image source={require('../../assets/Icons/SearchIcon.png')} style={styles.searchIcon}/>
          <TextInput
            placeholder="친구 검색"
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
          <Button iconSource={require('../../assets/buttons/CloseButton.png')} imageStyle={styles.closebutton}
            onPress={() => {
              setMyprofileVisible(true);
              setSearchQuery("");
              setFilteredData(friendsList);
            }}/>
          </View>
          </>
        }
        {filteredData.length === 0 ? (
          <Text>친구가 없습니다.</Text>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderFriendCard}
            keyExtractor={item => item.id.toString()}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  friendText: {
    flexDirection:'row',
    justifyContent:'space-between',
  },
  closebutton: {
    width: 20,
    height: 20,
  },
  friendListPage: {
    flex:1,
    backgroundColor: "#fff",
  },
  ListContainer: {
    width: "90%",
    height: "90%",
    alignSelf: 'center', 
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
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-evenly'
  },
  Button:{
    fontSize: 15,
    color: '#fff',
    padding: 20,
  },
  username: {
    flexDirection: 'row',
    width:250,
  },
  headerText: {
    flexDirection:'row',
    justifyContent:'space-between',
    paddingVertical: 10,
  },
  myProfileContainer: {
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
  },
  statusMessage: {
    fontSize: 14,
    color: '#979797',
    fontFamily: FontTheme.fonts.sub, 
    paddingRight: 6,
  },
  searchContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
    alignSelf: 'center',
  },
  searchIcon: {
    width: 20, // Set the desired width
    height: 20, // Set the desired height
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: 'black',
  },
  listContentContainer: {
    paddingHorizontal: 0, // Remove horizontal padding
  },
});

export default FriendsScreen;


{/* <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <ModalContainer>
            <ModalContent style={shadowStyles}>
              <Button
                title="친구요청 목록"
                style={{marginBottom: 20}}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Tabs', {screen: '친구요청 목록'});
                }}
              />
              <Button
                title="차단친구 목록"
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Tabs', {screen: '차단친구 목록'});
                }}
              />
            </ModalContent>
          </ModalContainer>
        </TouchableWithoutFeedback>
      </Modal> */}

    //   const ModalContainer = styled.View`
    //   flex: 1;
    //   justify-content: flex-start;
    //   align-items: flex-end;
    //   padding-top: 85px;
    //   padding-right: 20px;
    //   elevation: 5;
    // `;
    
    // const ModalContent = styled.View`
    //   width: 55%;
    //   padding-top: 15px;
    //   padding-bottom: 15px;
    //   background-color: white;
    //   border-radius: 10px;
    //   align-items: center;
    // `;
    
    // const shadowStyles = {
    //   shadowColor: '#000',
    //   shadowOffset: {
    //     width: 0,
    //     height: 2,
    //   },
    //   shadowOpacity: 0.25,
    //   shadowRadius: 3.84,
    
    //   elevation: 5,
    // };
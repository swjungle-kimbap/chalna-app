import React, {useState, useCallback, useMemo, useEffect} from 'react';
import { View, FlatList, TextInput, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Text from '../../components/common/Text';
import FriendCard from '../../components/Mypage/FriendCard';
import {StackNavigationProp} from '@react-navigation/stack';
import {Friend, RootStackParamList} from '../../interfaces';
import {axiosGet} from '../../axios/axios.method';
import {urls} from '../../axios/config';
import {useRecoilState} from 'recoil';
import {
  getKoreanInitials,
} from '../../service/Friends/FriendListAPI';
import {userInfoState} from '../../recoil/atoms';
import {navigate} from '../../navigation/RootNavigation';
import FontTheme from '../../styles/FontTheme';
import Button from '../../components/common/Button';
import HorizontalLine from '../../components/Mypage/HorizontalLine';
import ProfileImage from '../../components/common/ProfileImage';
import { getMMKVObject, setMMKVObject } from '../../utils/mmkvStorage';
import {friendRequest} from "../../interfaces/Friend.type";
import {fetchReceivedFriendRequest} from "../../service/Friends/FriendListAPI";

interface ApiResponse {
  status: string;
  message: string;
  data: Friend[];
}

type FriendsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '친구 목록'>;
};

const FriendsScreen: React.FC<FriendsScreenProps> = ({navigation}) => {
  const [friendsList, setFriendsList] = useState(getMMKVObject<Friend[]>("FriendList"));
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const [myprofileVisible, setMyprofileVisible] = useState(true);
  const [friendRequests, setFriendRequests] = useState<friendRequest[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchFriends = async () => {
        try {
          const response = await axiosGet<ApiResponse>(
            urls.GET_FRIEND_LIST_URL,
          );
          console.log('friend api response: ', response.data.data);
          const friends = response.data.data;
          setFriendsList(friends);
          setMMKVObject("FriendList", friends);
        } catch (error) {
          setError('Failed to fetch friends');
        }
      };

      const fetchFriendRequests = async () => {
        try {
          const response = await fetchReceivedFriendRequest();
          console.log('friend request api response: ', response);
          setFriendRequests(response);
        } catch (error) {
          setError('Failed to fetch friend requests');
        }
      };

      fetchFriends();
      fetchFriendRequests();
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
          onPress={() => navigate('로그인 성공', { screen: "친구", params: { screen: "마이페이지" }})}/>
      </View>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <ProfileImage profileImageId={userInfo.profileImageId} avatarStyle={styles.avatar}/>
        </View>
        <View style={styles.username}>
          <Text style={styles.text}>{userInfo.username}</Text>
        </View>
        <View style={styles.username}>
          <Text style={styles.statusMessage}>{userInfo.message}</Text>
        </View>
      </View>
    </View>
    );
  }

  const ReceivedRequests = ({ friendRequests }) => {
    return (
        <>
          <HorizontalLine />
          {friendRequests.length > 0 && (
              <>
                <TouchableOpacity style={styles.receivedRequestsContainer} onPress={() => navigate('친구 요청 목록')}>
                  <Text style={styles.text}>받은 친구 요청</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{friendRequests.length}</Text>
                  </View>
                  <Image source={require('../../assets/Icons/RightArrow.png')} style={styles.rightArrow} />
                </TouchableOpacity>
                <HorizontalLine />
              </>
          )}
        </>
    );
  };

  return (
    <View style={styles.friendListPage}>
      <View style={styles.ListContainer}>
        { myprofileVisible ?
          <>
          <Myprofile/>
            <ReceivedRequests friendRequests={friendRequests}/>
            <View style={styles.friendText}>
            <Text style={styles.text}>친구 목록</Text>
              <Button iconSource={require('../../assets/Icons/3dotsVertical.png')} imageStyle={styles.iconLeftt}
                      onPress={() => {
                        setMyprofileVisible(false);
                        setSearchQuery("");
                        setFilteredData(friendsList);
                      }}/>
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
                    setSearchQuery("");
                    setFilteredData(friendsList);
            }}/>
            <Button iconSource={require('../../assets/Icons/GoBack.png')} imageStyle={styles.gobackbutton}
                    onPress={() => {
                      setSearchQuery("");
                      setFilteredData(friendsList);
                      setMyprofileVisible(true);
                    }}/>
          </View>
          </>
        }
        {!filteredData ? (
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
    color: 'black',
  },
  gobackbutton: {
    width: 25,
    height: 25,
    color: 'grey',
    marginLeft:5,
  },
  friendListPage: {
    flex:1,
    backgroundColor: "#fff",
  },
  ListContainer: {
    width: "90%",
    height: "100%",
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
    width: 45,
    height: 45,
    borderRadius: 20,
    marginRight: 15,
    resizeMode: "contain"
  },
  text: {
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
    fontFamily:FontTheme.fonts.main,
    alignSelf: "flex-start"
  },
  statusMessage: {
    fontSize: 14,
    color: '#979797',
    fontFamily: FontTheme.fonts.sub,
    paddingRight: 6,
  },
  searchContainer: {
    marginTop: 20,
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
    marginRight: 5,
  },
  iconLeftt:{
    width: 20, // Set the desired width
    height: 20,
    justifyContent:'flex-start',
    marginRight:"auto"
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: 'black',
  },
  listContentContainer: {
    paddingHorizontal: 0, // Remove horizontal padding
  },
  receivedRequestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  badge: {
    backgroundColor: '#006a81',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginLeft: "auto",
    alignSelf: "center",
    marginBottom: 3
  },
  badgeText: {
    color: 'white',
  },
  rightArrow: {
    width: 17,
    height: 17,
    marginBottom: 4,
    justifyContent: "flex-end",
    alignSelf: "center",
    marginLeft:5,
  },
});

export default FriendsScreen;


// const NavModal = () => {
//   return (
//       <>
//         <Modal
//             visible={modalVisible}
//             transparent={true}
//             animationType="fade"
//             onRequestClose={() => setModalVisible(false)}>
//           <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
//             <ModalContainer>
//               <ModalContent style={shadowStyles}>
//                 <Button
//                     title="친구요청 목록"
//                     style={{marginBottom: 20}}
//                     onPress={() => {
//                       setModalVisible(false);
//                       navigation.navigate('Tabs', {screen: '친구요청 목록'});
//                     }}
//                 />
//                 <Button
//                     title="차단친구 목록"
//                     onPress={() => {
//                       setModalVisible(false);
//                       navigation.navigate('Tabs', {screen: '차단친구 목록'});
//                     }}
//                 />
//               </ModalContent>
//             </ModalContainer>
//           </TouchableWithoutFeedback>
//         </Modal>
//       </>
//   );
// };
//
//
//
//
//
//       const ModalContainer = styled.View`
//       flex: 1;
//       justify-content: flex-start;
//       align-items: flex-end;
//       padding-top: 85px;
//       padding-right: 20px;
//       elevation: 5;
//     `;
//
//     const ModalContent = styled.View`
//       width: 55%;
//       padding-top: 15px;
//       padding-bottom: 15px;
//       background-color: white;
//       border-radius: 10px;
//       align-items: center;
//     `;
//
//     const shadowStyles = {
//       shadowColor: '#000',
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       shadowOpacity: 0.25,
//       shadowRadius: 3.84,
//
//       elevation: 5,
//     };

import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import Text from "../../components/common/Text";
import Button from '../../components/common/Button';
import FriendCard from "../../components/FriendCard";
import { StackNavigationProp } from "@react-navigation/stack";
import { Friend, RootStackParamList } from "../../interfaces";
import { axiosGet } from "../../axios/axios.method";
import { urls } from "../../axios/config";
import { useRecoilState } from 'recoil';
import { getKoreanInitials, handleDownloadProfile } from '../../service/Friends/FriendListAPI';
import { ProfileImageMapState } from '../../recoil/atoms';

interface ApiResponse {
    status: string;
    message: string;
    data: Friend[];
}

type FriendsScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, '친구 목록'>
};


const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
    const [friendsList, setFriendsList] = useState([]);
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredData, setFilteredData] = useState<Friend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [profileImageMap, setProfileImageMap] = useRecoilState(ProfileImageMapState)

    useFocusEffect(
        useCallback(() => {
            const fetchFriends = async () => {
                setLoading(true);
                try {
                    const response = await axiosGet<ApiResponse>(urls.GET_FRIEND_LIST_URL);
                    console.log("friend api response: ", response.data.data);
                    const friends = response.data.data;
                    const updatedProfileImageMap = new Map(profileImageMap);

                    for (const friend of friends) {
                      const profileImageUri = updatedProfileImageMap.get(friend.profileImageId);
                      if (!profileImageUri && friend.profileImageId) {
                        const newProfileImageUri = await handleDownloadProfile(friend.profileImageId);
                        updatedProfileImageMap.set(friend.profileImageId, newProfileImageUri);
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
        }, [])
    );

    useMemo(() => {
        const trimmedQuery = searchQuery.replace(/\s+/g, '');
        if (!trimmedQuery) {
            setFilteredData(friendsList);
        } else {
            const filtered = friendsList.filter(({ username, message }) =>
                (username && (username.includes(trimmedQuery) ||  getKoreanInitials(username).includes(trimmedQuery))) ||
                (message && (message.includes(trimmedQuery) || getKoreanInitials(message).includes(trimmedQuery)))
            );
            setFilteredData(filtered);
        }
    }, [friendsList, searchQuery]);

    const handleCardPress = useCallback((cardId: number) => {
        setExpandedCardId(prevId => prevId === cardId ? null : cardId);
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const renderFriendCard = useCallback(({ item }: { item: Friend }) => (
        <FriendCard
            user={item}
            isExpanded={item.id === expandedCardId}
            onExpand={() => handleCardPress(item.id)}
            navigation={navigation}
            options={'friend'}
        />
    ), [expandedCardId, navigation]);

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text>Error loading friends: {error}</Text>;
    return (
        <FriendsStyle>
            {/* <ImageTextButton
                    iconSource={require('../../assets/Icons/cogIcon.png')}
                    imageStyle={{height:15, width:15}}
                    style={{padding: 10, alignSelf:'flex-end', marginRight:20}}
                    onPress={() => setModalVisible(true) } /> */}
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="친구 검색"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    style={styles.searchInput}
                />
            <TouchableOpacity>
                <Image source={require('../../assets/Icons/SearchIcon.png')} style={styles.searchIcon} />
                </TouchableOpacity>
            </View>
            {filteredData.length === 0 ? (
                <Text>해당 친구가 존재하지 않습니다.</Text>
            ) : (
                <FlatList
                data={filteredData}
                renderItem={renderFriendCard}
                keyExtractor={(item) => item.id.toString()}
                />
      )}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={()=>setModalVisible(false)}>
                    <ModalContainer>
                        <ModalContent style={shadowStyles}>
                            <Button title="친구요청 목록"
                                style={{marginBottom: 20}}
                                onPress={() => {
                                    setModalVisible(false);
                                    navigation.navigate('Tabs', {screen: '친구요청 목록' });
                                }} />
                            <Button title="차단친구 목록" onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('Tabs', {screen: '차단친구 목록' });
                            }} />
                        </ModalContent>
                    </ModalContainer>
                </TouchableWithoutFeedback>
            </Modal>
        </FriendsStyle>
    );
};

const FriendsStyle = styled.View`
  background-color: #FFFFFF;

`;

const styles = StyleSheet.create({
    searchContainer: {
        marginTop:10,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 10,
        width: '90%',
        alignSelf: 'center',
    },
    searchIcon: {
        width: 20,  // Set the desired width
        height: 20, // Set the desired height
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: 'black'
    },
    listContentContainer: {
        paddingHorizontal: 0, // Remove horizontal padding
    },
});

const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-start;
  align-items: flex-end;
    padding-top: 85px;
  padding-right: 20px;
    elevation: 5;
`;

const ModalContent = styled.View`
  width: 55%;
  padding-top: 15px;
    padding-bottom: 15px;
  background-color: white;
  border-radius: 10px;
  align-items: center;
`;

const shadowStyles = {
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
};


export default FriendsScreen;

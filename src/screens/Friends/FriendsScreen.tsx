import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import Text from "../../components/common/Text";
import Button from '../../components/common/Button';
import FriendCard from "../../components/FriendCard";
import { StackNavigationProp } from "@react-navigation/stack";
import { AxiosResponse, Friend, RootStackParamList, User } from "../../interfaces";
import { axiosGet } from "../../axios/axios.method";
import { urls } from "../../axios/config";
import ImageTextButton from "../../components/common/Button";
import {  DownloadFileResponse } from "../../interfaces";
import { useRecoilState } from 'recoil';
import { FriendsMapState } from '../../recoil/atoms';
import { getKoreanInitials } from '../../service/Friends/KoreanInitials';

interface ApiResponse {
    status: string;
    message: string;
    data: Friend[];
}

type FriendsScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, '친구 목록'>
};

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
    const [friendsMap, setFriendsMap] = useRecoilState(FriendsMapState);
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredData, setFilteredData] = useState<Friend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useFocusEffect(
        useCallback(() => {
            const fetchFriends = async () => {
                setLoading(true);
                try {
                    const response = await axiosGet<ApiResponse>(urls.GET_FRIEND_LIST_URL);
                    console.log("friend api response: ", response.data.data);
                    const friends = response.data.data;
                    
                    // 각 친구의 프로필 이미지를 다운로드
                    const friendsMap = new Map();
                    for (const friend of friends) {
                        if (friend.profileImageId) {
                            const profileImageUrl = await handleDownloadProfile(friend.profileImageId);
                            friend.profileImageUrl = profileImageUrl;
                            console.log('프로필 이미지 ㅣ: ', profileImageUrl);
                        }
                        friendsMap.set(friend.id, friend);
                    }
                    setFriendsMap(friendsMap);
                } catch (error) {
                    setError('Failed to fetch friends');
                } finally {
                    setLoading(false);
                }
            };

            fetchFriends();
        }, [])
    );

    useMemo(() => {
        const trimmedQuery = searchQuery.replace(/\s+/g, '');
        const friendslist = Array.from(friendsMap.values());
        if (!trimmedQuery) {
            setFilteredData(friendslist);
        } else {
            const filtered = friendslist.filter(({ username, message }) =>
                (username && (username.includes(trimmedQuery) ||  getKoreanInitials(username).includes(trimmedQuery))) ||
                (message && (message.includes(trimmedQuery) || getKoreanInitials(message).includes(trimmedQuery)))
            );
            setFilteredData(filtered);
        }
    }, [friendsMap, searchQuery]);

    const handleDownloadProfile = async (profileId: number) => {
        try {
            const downloadResponse = await axiosGet<AxiosResponse<DownloadFileResponse>>(`${urls.FILE_DOWNLOAD_URL}${profileId}`, "프로필 다운로드");
            const { presignedUrl } = downloadResponse.data.data;
            return presignedUrl;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

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

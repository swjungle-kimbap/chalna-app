import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import Text from "../../components/common/Text";
import Button from '../../components/common/Button';
import FriendCard from "../../components/FriendCard";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import { axiosGet } from "../../axios/axios.method";
import { urls } from "../../axios/config";
import ImageTextButton from "../../components/common/Button";
import {getKoreanInitials} from '../../service/Friends/KoreanInitials';

interface ApiResponse {
    status: number;
    message: string;
    data: Friend[];
}

interface User {
    id: number;
    username: string;
    message: string;
}

interface Friend extends User {
    profileImage: string;
    status: number;
}

type FriendsScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, '친구 목록'>
};

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [friendsData, setFriendsData] = useState<Friend[]>([]);
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
                    setFriendsData(response.data.data);
                    setFilteredData(response.data.data); // Initially setting filteredData to all friends
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
        if (!trimmedQuery) {
            setFilteredData(friendsData);
        } else {
            const filtered = friendsData.filter(({ username, message }) =>
                (username && (username.includes(trimmedQuery) ||  getKoreanInitials(username).includes(trimmedQuery))) ||
                (message && (message.includes(trimmedQuery) || getKoreanInitials(message).includes(trimmedQuery)))
            );
            setFilteredData(filtered);
        }
    }, [friendsData, searchQuery]);

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

            <ImageTextButton
                    iconSource={require('../../assets/Icons/cogIcon.png')}
                    imageStyle={{height:15, width:15}}
                    style={{padding: 10, alignSelf:'flex-end', marginRight:20}}
                    onPress={() => setModalVisible(true) } />
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

import React, { useState, useEffect,useRef } from 'react';
import styled from "styled-components/native";
import Text from "../../components/common/Text";
import Button from '../../components/common/Button'
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import {View, FlatList, Image, TextInput, StyleSheet ,TouchableOpacity} from "react-native";
import FriendCard from "../../components/FriendCard";
import Config from "react-native-config";
import { ActivityIndicator } from "react-native";
import axios, { AxiosInstance } from "axios";
import { axiosGet } from "../../axios/axios.method";
interface ApiResponse {
  status: number;
  message: string;
  data: {
    friends: Friend[];
  };
}

export interface User {
    id: number;
    username: string;
    message: string;
}

// Friend 인터페이스
export interface Friend extends User {
    profileImage: string;
    status: number; // 1: 친구, 2: 차단친구, 3: 인연, 4: 기타
}

type FriendsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '차단친구 목록'>
};


const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [friendsData, setFriendsData] = useState<Friend[]>([]);
    const [filteredData, setFilteredData] = useState<Friend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFriends = async () => {
            try {

                const response = await axiosGet<ApiResponse>(Config.GET_FRIEND_LIST_URL);

                console.log(response.data)
                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    setFriendsData(response.data.data);
                    setFilteredData(response.data.data);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setError('Unexpected response structure');
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios error', error.message);
                    setError(error.message);
                } else {
                    console.error('Error friends data:', error);
                    setError('Unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };


        fetchFriends();
    }, []);


    const handleCardPress = (cardId: number) => {
        if(expandedCardId===cardId){
            setExpandedCardId(null);
        } else {
            setExpandedCardId(cardId);
        }
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query === '') {
          setFilteredData(friendsData);
        }
      }

    const handleSearchButtonPress = () => {
    const trimmedQuery = searchQuery.replace(/\s+/g, ''); // 공백 제거
    if (trimmedQuery === '') {
        setFilteredData(friendsData);
        return;
    }
    const filtered = friendsData.filter(user =>
        (user.username && user.username.includes(trimmedQuery)) ||
        (user.message && user.message.includes(trimmedQuery))
    );
    setFilteredData(filtered);
    };

    const renderFriendCard = ({item}: {item: Friend}) => (
        <FriendCard
            user={item}
            isExpanded={item.id === expandedCardId}
            onExpand={()=> handleCardPress(item.id)}
            navigation={navigation}
        />);

    if (loading) {
            return (
                <FriendsStyle>
                    <ActivityIndicator size="large" color="#0000ff" />
                </FriendsStyle>
            );
    }

    if (error) {
        return (
            <FriendsStyle>
                <Text>친구 목록을 불러오는 중 오류가 발생했습니다: {error}</Text>
            </FriendsStyle>
        );
    }

    return (
        <FriendsStyle>

            {/*<Button title="차단친구 목록" onPress={() => navigation.navigate('차단친구 목록')} />*/}
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="친구 검색"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    style={styles.searchInput}
                />
            <TouchableOpacity onPress={handleSearchButtonPress}>
                <Image source={require('../../assets/Icons/SearchIcon.png')} style={styles.searchIcon} />
                </TouchableOpacity>
            </View>
            {filteredData.length === 0 ? (
                <Text style={{marginTop:30, marginBottom: 30}}>새로운 인연을 만나보세요.</Text>
            ) : (
                <FlatList
                data={filteredData}
                renderItem={renderFriendCard}
                keyExtractor={(item) => item.id.toString()}
                />
      )}

        </FriendsStyle>
    );
};

const FriendsStyle = styled.View`
  background-color: #FFFFFF;
   
`;

const styles = StyleSheet.create({
    searchContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 2,
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
    },
    listContentContainer: {
        paddingHorizontal: 0, // Remove horizontal padding
    },
});

export default FriendsScreen;

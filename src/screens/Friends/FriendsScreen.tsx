import React, { useState, useEffect,useRef } from 'react';
import styled from "styled-components/native";
import Text from "../../components/common/Text";
import Button from '../../components/common/Button'
import RoundBox  from "../../components/common/RoundBox";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import {View, FlatList, Image, TextInput, StyleSheet} from "react-native";
import FriendCard from "../../components/FriendCard";
import Config from "react-native-config";
import { ActivityIndicator } from "react-native";
import axios, { AxiosInstance } from "axios";
import { getKeychain, setKeychain } from "../../utils/keychain";

// interface Friend {
//   id : string;
//   username: string;
//   profileImage: string;
//   message: string;
// }

interface ApiResponse {
  status: number;
  message: string;
  data: {
    friends: Friend[];
  };
}

export interface User {
    id: string;
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
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [friendsData, setFriendsData] = useState<Friend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token =  await getKeychain('accessToken');
                const response = await axios.get<ApiResponse>('https://chalna.shop/api/v1/friend', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log(response.data)
                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    setFriendsData(response.data.data);
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


    const handleCardPress = (cardId: string) => {
        if(expandedCardId===cardId){
            setExpandedCardId(null);
        } else {
            setExpandedCardId(cardId);
        }
    }

    const  handleSearch = (query: string)=>{
        setSearchQuery(query);
    }

    const filteredData = friendsData.filter(user =>
        user.username.includes(searchQuery) || user.message.includes(searchQuery)
    );

    const renderFriendCard = ({item}: {item: Friend}) => (
        <FriendCard
            user={item}
            isExpanded={item.username===expandedCardId}
            onExpand={()=> handleCardPress(item.id)}
            // navigation={navigation}
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
            <Text>친구목록 페이지 입니다.</Text>
            <Button title="차단친구 목록" onPress={() => navigation.navigate('차단친구 목록')} />
            <View style={styles.searchContainer}>
                <Image source={require('../../assets/Icons/SearchIcon.png')} style={styles.searchIcon} />
                <TextInput
                    placeholder="친구 검색"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            <FlatList
                data={filteredData}
                renderItem={renderFriendCard}
                keyExtractor={(item) => item.username}
            />
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
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 10,
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

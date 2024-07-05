import React, { useState, useEffect,useRef, useCallback } from 'react';
import styled from "styled-components/native";
import Text from "../../components/common/Text";
import Button from '../../components/common/Button'
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import {View, FlatList, Image, TextInput, StyleSheet ,TouchableOpacity, Modal, TouchableWithoutFeedback} from "react-native";
import FriendCard from "../../components/FriendCard";
import Config from "react-native-config";
import { ActivityIndicator } from "react-native";
import axios, { AxiosInstance } from "axios";
import { axiosGet } from "../../axios/axios.method";
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import ImageTextButton from "../../components/common/Button";
import {urls} from "../../axios/config";
import friendRequestScreen from "./FriendRequestScreen";

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

    const naviagtionProp = useNavigation();

    useFocusEffect(
        useCallback(() => {
        const fetchFriends = async () => {
            try {

            console.log("Fetching friends data...");
            const response = await axiosGet<ApiResponse>(urls.GET_FRIEND_LIST_URL);
            console.log("Response received:", response.data);
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
        }, [])
    );


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
            <TouchableOpacity onPress={handleSearchButtonPress}>
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
    
    //shadow-color: #000;
    //shadow-offset: 0,2;
    //shadow-opacity: 0.25;
    //shadow-radius: 3.84px;
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

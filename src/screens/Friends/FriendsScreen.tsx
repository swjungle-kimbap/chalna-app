import React, { useState } from 'react';
import styled from "styled-components/native";
import Text from "../../components/common/Text";
import Button from '../../components/common/Button'
import RoundBox  from "../../components/common/RoundBox";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import { User } from "../../interfaces/User";
import {View, FlatList, Image, TextInput, StyleSheet} from "react-native";
import FriendCard from "../../components/FriendCard.tsx";


type FriendsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '차단친구 목록'>
  users: User[]
};

const DATA: User[] = [
    { id: '1', name: '최동환', statusMsg: 'branch 잘쓰세요', status: 1 },
    { id: '2', name: '이다빈', statusMsg: '굿굿티비', status: 1 },
    { id: '3', name: '이다인', statusMsg: '집에가고싶다', status: 1 },
    { id: '4', name: '김주영', statusMsg: 'Hem', status: 1 },
    { id: '5', name: '김은식', statusMsg: '맞죠', status: 1 },
    { id: '6', name: '박지아', statusMsg: '등산가실분', status: 2 },
    { id: '7', name: 'Taylor', statusMsg: 'Jungle', status: 2 },
    { id: '8', name: 'Jesse', statusMsg: 'Welcome', status: 2 },
    { id: '9', name: 'Tom', statusMsg: 'Chalna', status: 2 },
    { id: '10', name: 'Keith', statusMsg: 'Drivers', status: 2 },
    { id: '11', name: 'Shiro', statusMsg: 'License', status: 2 },
];

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

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

    const filteredData = DATA.filter(user =>
        user.name.includes(searchQuery) || user.statusMsg.includes(searchQuery)
    );

    const renderFriendCard = ({item}: {item: User}) => (
        <FriendCard
            user={item}
            isExpanded={item.id===expandedCardId}
            onExpand={()=> handleCardPress(item.id)}
        />);

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
                keyExtractor={(item) => item.id}
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

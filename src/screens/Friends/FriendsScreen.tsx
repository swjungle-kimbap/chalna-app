import React, { useState } from 'react';
import styled from "styled-components/native";
import Text from "../../components/common/Text";
import Button from '../../components/common/Button'
import RoundBox  from "../../components/common/RoundBox";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import { User } from "../../interfaces/User";
import {View, FlatList, Image, TextInput, StyleSheet, SafeAreaView} from "react-native";
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
        <SafeAreaView style={{flex: 1}}>
            <CardContainer>
                <View style={{padding:10, flexDirection: 'row', justifyContent:'flex-end', marginRight: 25}}>
                    <Button
                        iconSource={require('../../assets/Icons/MoreInfo.png')}
                        imageStyle={{ width: 20, height: 20}}
                        onPress={() => navigation.navigate('차단친구 목록')} />
                </View>
                <SearchContainer>
                    <Image source={require('../../assets/Icons/SearchIcon.png')} style={styles.searchIcon} />
                    <TextInput
                        placeholder="친구 검색"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </SearchContainer>
                <FlatList
                    data={filteredData}
                    renderItem={renderFriendCard}
                    keyExtractor={(item) => item.id}
                />
            </CardContainer>
        </SafeAreaView>
    );
};

const CardContainer = styled.View`
    flex: 1;
    background-color: #FFFFFF;
    padding-bottom: 60px;
   
`;

const SearchContainer = styled.View`
  flex-direction: row;

  border-color: #CCC;
  border-width: 1px;
  border-radius: 5px;


  width: 85%;
  align-self: center;
    align-items: center;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  height: 40px;
`;


const styles = StyleSheet.create({
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
        marginLeft: 15,
    },
});

export default FriendsScreen;

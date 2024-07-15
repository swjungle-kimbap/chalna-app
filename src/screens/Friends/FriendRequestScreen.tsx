import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Text from '../../components/common/Text';
import FriendRequestCard from '../../components/Mypage/FriendRequestCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { friendRequest, RootStackParamList } from '../../interfaces';
import { axiosGet } from '../../axios/axios.method';
import { urls } from '../../axios/config';
import { useRecoilState } from 'recoil';
import { getKoreanInitials } from '../../service/Friends/FriendListAPI';
import { userInfoState } from '../../recoil/atoms';
import FontTheme from '../../styles/FontTheme';
import Button from '../../components/common/Button';
import HorizontalLine from '../../components/Mypage/HorizontalLine';
import ProfileImage from '../../components/common/ProfileImage';
import { fetchReceivedFriendRequest } from '../../service/Friends/FriendListAPI';

interface ApiResponse {
    status: string;
    message: string;
    data: friendRequest[];
}

type FriendRequestScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, '받은친구요청'>;
};

const FriendRequestScreen: React.FC<FriendRequestScreenProps> = ({ navigation }) => {
    const [friendRequests, setFriendRequests] = useState<friendRequest[]>([]);
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredData, setFilteredData] = useState<friendRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            const fetchFriendRequests = async () => {
                try {
                    const response = await fetchReceivedFriendRequest();
                    console.log('friend request api response: ', response);
                    setFriendRequests(response);
                } catch (error) {
                    setError('Failed to fetch friend requests');
                }
            };

            fetchFriendRequests();
        }, []),
    );


    const handleCardPress = useCallback((cardId: number) => {
        setExpandedCardId(prevId => (prevId === cardId ? null : cardId));
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const renderFriendRequestCard = useCallback(
        ({ item }: { item: friendRequest }) => (
            <FriendRequestCard
                request={item}
                isExpanded={item.id === expandedCardId}
                onExpand={() => handleCardPress(item.id)}
                navigation={navigation}
            />
        ),
        [expandedCardId, navigation],
    );

    return (
        <View style={styles.friendListPage}>
            <View style={styles.ListContainer}>
                <View style={styles.friendText}>
                    <Text style={styles.text}>받은 친구 요청</Text>

                </View>
                {!friendRequests ? (
                    <Text>친구 요청이 없습니다.</Text>
                ) : (
                    <FlatList
                        data={friendRequests}
                        renderItem={renderFriendRequestCard}
                        keyExtractor={item => item.id.toString()}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    friendText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        marginLeft: 5,
    },
    friendListPage: {
        flex: 1,
        backgroundColor: "#fff",
    },
    ListContainer: {
        width: "90%",
        height: "100%",
        alignSelf: 'center',
        marginTop: 10,
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
    Button: {
        fontSize: 15,
        color: '#fff',
        padding: 20,
    },
    username: {
        flexDirection: 'row',
        width: 250,
    },
    headerText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        fontFamily: FontTheme.fonts.main,
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
        width: 20,
        height: 20,
        marginRight: 5,
    },
    iconLeftt: {
        width: 20,
        height: 20,
        justifyContent: 'flex-start',
        marginRight: "auto"
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: 'black',
    },
    listContentContainer: {
        paddingHorizontal: 0,
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
        marginLeft: 5,
    },
});

export default FriendRequestScreen;

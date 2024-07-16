import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Text from '../../components/common/Text';
import FriendRequestCard from '../../components/Mypage/FriendRequestCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces'
import FontTheme from '../../styles/FontTheme';
import { fetchReceivedFriendRequest, fetchSentFriendRequest } from '../../service/Friends/FriendListAPI';
import {friendRequest} from "../../interfaces/Friend.type";
import Button from "../../components/common/Button";
import { navigate } from '../../navigation/RootNavigation';
import RoundBox from '../../components/common/RoundBox';

type FriendRequestScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, '친구요청 목록'>;
};

const FriendRequestScreen: React.FC<FriendRequestScreenProps> = ({ navigation }) => {
    const [receivedFriendRequests, setReceivedFriendRequests] = useState<friendRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            const fetchFriendRequests = async () => {
                try {
                    const receivedResponse = await fetchReceivedFriendRequest();
                    setReceivedFriendRequests(receivedResponse);
                } catch (error) {
                    setError('Failed to fetch friend requests');
                }
            };

            fetchFriendRequests();
        }, []),
    );

    const renderReceivedFriendRequestCard = useCallback(
        ({ item }: { item: friendRequest }) => (
            <FriendRequestCard
                request={item}
                navigation={navigation}
            />
        ),
        [navigation],
    );


    return (
        <View style={styles.friendListPage}>
            <View style={styles.ListContainer}>
                {!receivedFriendRequests?.length ? (
                    <>
                    <Text variant={'main'} style={{marginTop: 20, color: 'grey'}}>받은 친구 요청이 없습니다. 😭</Text>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <RoundBox>
                            <Button variant="main" title="만나기" onPress={()=>{navigate("인연")}}/>
                        </RoundBox>
                    </View>
                    </>
                ) : (
                    <FlatList
                        data={receivedFriendRequests}
                        renderItem={renderReceivedFriendRequestCard}
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
    listContentContainer: {
        paddingHorizontal: 0,
    },
    receivedRequestsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

});

export default FriendRequestScreen;

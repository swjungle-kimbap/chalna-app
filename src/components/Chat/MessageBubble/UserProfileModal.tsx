// import React from 'react';
// import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
// import styled from 'styled-components/native';
// import Text from '../../common/Text';
// import ImageTextButton from "../../common/Button";
// import FastImage, { Source } from 'react-native-fast-image';
// import {useState, useEffect} from "react";
// import {fetchRelation} from "../../../service/Friends/FriendListAPI";
//
// interface UserProfileModalProps {
//     visible: boolean;
//     onClose: () => void;
//     username?: string;
//     profilePicture?: string;
//     chatRoomType: string;
//     otherId: number;
//
// const UserProfileModal: React.FC<UserProfileModalProps> = ({
//                                                                visible, onClose, username, profilePicture, chatRoomType, otherId
//                                                            }) => {
//
//     const [relationCount, setRelationCount] = useState<number | null>(null);
//
//     useEffect(() => {
//         if (visible) {
//             fetchRelation(otherId).then(count => setRelationCount(count));
//         }
//     }, [visible, otherId]);
//
//     return (
//         <Modal
//             animationType="slide"
//             transparent={true}
//             visible={visible}
//             onRequestClose={onClose}
//         >
//             <ModalContainer>
//                 <ModalContent>
//                     <ImageTextButton
//                         iconSource={require('../../../assets/Icons/closeIcon.png')}
//                         imageStyle={{ height: 15, width: 15 }}
//                         onPress={onClose}
//                         style={{ alignSelf: 'flex-end' }}
//                     />
//                     {profilePicture ? (
//                         <FastImage
//                             style={styles.profilePictureModal}
//                             source={{ uri: profilePicture, priority: FastImage.priority.normal } as Source}
//                             resizeMode={FastImage.resizeMode.cover}
//                         />
//                     ) : (
//                         <FastImage
//                             source={require('../../../assets/images/anonymous.png')}
//                             style={styles.profilePictureModal}
//                             resizeMode={FastImage.resizeMode.cover}
//                         />
//                     )}
//                     <NameBtnContainer>
//                         <Text variant="subtitle">{username}</Text>
//                         {chatRoomType === 'FRIEND' ? (
//                             <FastImage
//                                 source={require('../../../assets/Icons/FriendsIcon.png')}
//                                 style={{ height: 18, width: 24, marginLeft: 6, marginTop: 7 }}
//                                 resizeMode={FastImage.resizeMode.stretch}
//                             />
//                         ) : ( <></>
//                             // <ImageTextButton
//                             //     style={{ marginTop: 1, marginLeft: 5 }}
//                             //     iconSource={require('../../../assets/Icons/AddFriendIcon.png')}
//                             //     imageStyle={{ height: 25, width: 25 }}
//                             //     onPress={}
//                             // />
//                         )}
//                     </NameBtnContainer>
//                     <Text variant="sub" style={{ size: 12, marginBottom: 10 }}>
//                         {relationCount !== null ? `스친 횟수: ${relationCount}` : "Loading..."}
//                     </Text>
//                 </ModalContent>
//             </ModalContainer>
//         </Modal>
//     );
// };
//
// const styles = StyleSheet.create({
//     profilePictureModal: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//     },
// });
//
// const ModalContainer = styled.View`
//     flex: 1;
//     justify-content: center;
//     align-items: center;
//     background-color: rgba(0, 0, 0, 0.5);
// `;
//
// const ModalContent = styled.View`
//     width: 80%;
//     background-color: white;
//     padding: 20px;
//     border-radius: 10px;
//     align-items: center;
// `;
//
// const NameBtnContainer = styled.View`
//     margin-top: 10px;
//     margin-bottom: 5px;
//     flex-direction: row;
// `;
//
// export default UserProfileModal;


import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import Text from '../../common/Text';
import ImageTextButton from "../../common/Button";
import FastImage, { Source } from 'react-native-fast-image';
import { axiosGet } from '../../../axios/axios.method';
import { urls } from '../../../axios/config';
import ProfileImage from "../../common/ProfileImage";

interface UserProfileModalProps {
    visible: boolean;
    onClose: () => void;
    username?: string;
    profileImageId?: number;
    chatRoomType: string;
    otherId: number;
}

// Fetch relation function
const fetchRelation = async (id: number): Promise<number | null> => {
    try {
        const response = await axiosGet(urls.GET_RELATION_URL + `/${id}`, "관계 조회 성공");
        return response?.data?.data.overlapCount;
    } catch (error) {
        console.error('Failed to fetch relation', error);
        return null;
    }
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
                                                               visible, onClose, username, profileImageId, chatRoomType, otherId
                                                           }) => {

    const [relationCount, setRelationCount] = useState<number | null>(null);

    useEffect(() => {
        if (visible) {
            fetchRelation(otherId).then(count => setRelationCount(count));
        }
    }, [visible, otherId]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <ModalContainer>
                <ModalContent>
                    <ImageTextButton
                        iconSource={require('../../../assets/Icons/closeIcon.png')}
                        imageStyle={{ height: 15, width: 15 }}
                        onPress={onClose}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    <ProfileImage profileImageId={profileImageId}/>
                    <NameBtnContainer>
                        <Text variant="subtitle">{username}</Text>
                        {chatRoomType === 'FRIEND' ? (
                            <FastImage
                                source={require('../../../assets/Icons/FriendsIcon.png')}
                                style={{ height: 18, width: 24, marginLeft: 6, marginTop: 7 }}
                                resizeMode={FastImage.resizeMode.stretch}
                            />
                        ) : ( <></>
                            // <ImageTextButton
                            //     style={{ marginTop: 1, marginLeft: 5 }}
                            //     iconSource={require('../../../assets/Icons/AddFriendIcon.png')}
                            //     imageStyle={{ height: 25, width: 25 }}
                            //     onPress={}
                            // />
                        )}
                    </NameBtnContainer>
                    <Text variant="sub" style={{ fontSize: 12, marginBottom: 10 }}>
                        {relationCount !== null ? `스친 횟수: ${relationCount}` : "Loading..."}
                    </Text>
                </ModalContent>
            </ModalContainer>
        </Modal>
    );
};

const styles = StyleSheet.create({
    profilePictureModal: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
});

const ModalContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
    width: 80%;
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    align-items: center;
`;

const NameBtnContainer = styled.View`
    margin-top: 10px;
    margin-bottom: 5px;
    flex-direction: row;
`;

export default UserProfileModal;

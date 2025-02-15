import React from 'react';
import { View,  StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import ImageTextButton from "./Button";
import TitleText from "./Text";
import {chatRoomMember} from "../../interfaces/Chatting.type";
import MemberList from "../Chat/MemberList";
import memberList from "../Chat/MemberList";


interface MenuModalProps {
    title: string;
    isVisible: boolean;
    onClose: () => void;
    menu1: string;
    onMenu1: () => void;
    menu2?: string;
    onMenu2?: () => void;
    menu3?: string;
    onMenu3?: () => void;
    members?: chatRoomMember[];
    chatRoomId: number,
    chatRoomType: string,
    myname: string,
}

const MenuModal: React.FC<MenuModalProps> = ({ title, isVisible, onClose,
                                                 menu1, onMenu1, menu2, onMenu2, menu3, onMenu3,
                                                 members, chatRoomId, chatRoomType, myname }) => {
    // This could be further refactored to use an array of menu items if the pattern grows
    const titleContent = title===null? "메뉴":title;
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            style={styles.modal}
            animationIn="slideInRight"
            animationOut="slideOutRight"
        >
            <View style={styles.modalContent}>
                <ImageTextButton
                    IconSource = {require('../../assets/Icons/closeIcon.png')}
                    imageStyle={{ height: 15, width: 15}}
                    onPress={onClose} />

                <TitleText>{titleContent}</TitleText>

                {menu2 && <ImageTextButton title={menu2} onPress={onMenu2} style={{marginBottom:20}} />}
                {menu3 && <ImageTextButton title={menu3} onPress={onMenu3}  style={{marginBottom:20}}/>}

                {members && <MemberList members={members} chatRoomId={chatRoomId} chatRoomType={chatRoomType} myname={myname}/>}

                <ImageTextButton title={menu1} onPress={onMenu1}  style={{marginBottom:20, marginTop:'auto'}} />

            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        position:'absolute',
        right:0,
        width: '70%',
        height: '100%',
        backgroundColor: 'white',
        padding: 22,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        alignItems: 'center',
    },
    buttonContainer:{
        marginVertical: 20,
        width:'90%',
    }
});

export default MenuModal;

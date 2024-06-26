import React from 'react';
import { View,  StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import ImageTextButton from "./Button";
import TitleText from "./Text";


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
}

const MenuModal: React.FC<MenuModalProps> = ({ title, isVisible, onClose, menu1, onMenu1, menu2, onMenu2, menu3, onMenu3 }) => {
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
                <TitleText>{titleContent}</TitleText>
                <ImageTextButton title={menu1} onPress={onMenu1}  style={{marginBottom:20, marginTop:20}} />
                {menu2 && <ImageTextButton title={menu2} onPress={onMenu2} style={{marginBottom:20}} />}
                {menu3 && <ImageTextButton title={menu3} onPress={onMenu3}  style={{marginBottom:20}}/>}
                <ImageTextButton title="Close" onPress={onClose} />
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
        width: '65%',
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

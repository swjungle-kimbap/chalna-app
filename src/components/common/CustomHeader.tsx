import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface HeaderProps {
    title: string;
    onBackPress: () => void;
    onMenuPress: () => void;
    onBtnPress?:()=>void;
}


const CustomHeader: React.FC<HeaderProps> = ({ title, onBackPress, onMenuPress, onBtnPress }) => {
    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
                <Image source={require('../../assets/icons/backIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.rightIcons}>
                {onBtnPress!==null &&(
                    <TouchableOpacity onPress={onBtnPress} style={styles.iconButton}>
                        <Image source={require('../../assets/Icons/addFriendIcon.png')} style={styles.icon} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                    <Image source={require('../../assets/icons/menuIcon.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        elevation: 4,
        zIndex: 1000, // Ensure the header is above other elements
    },
    iconButton: {
        padding: 10,
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default CustomHeader;

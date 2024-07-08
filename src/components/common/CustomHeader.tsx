import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Text from './Text';

interface HeaderProps {
    title?: string;
    titleSmall?:string;
    subtitle?: string;
    onBackPress?: () => void;
    onMenuPress?: () => void;
    onBtnPress?:()=>void;
    useNav?:boolean;
    useMenu?:boolean;
    showBtn?:boolean; // Btn이 필요한 조건 받는 상태값
}

const CustomHeader: React.FC<HeaderProps> = ({ title,titleSmall, subtitle, onBackPress, onMenuPress, onBtnPress, showBtn, useNav, useMenu }) => {
    return (
        <View style={styles.headerContainer}>
            {onBtnPress!==null && useNav && (
                <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
                    <Image source={require('../../assets/Icons/goBackIcon.png')} style={styles.icon} />
                </TouchableOpacity>)
            }
            <View style={styles.titleContainer}>
                {title && <Text variant='subtitle' children={title} />}
                {titleSmall && <Text variant='mainBold' children={titleSmall} />}
                {subtitle && <Text variant='sub'>{subtitle}</Text>}
            </View>
            <View style={styles.rightIcons}>
                {onBtnPress!==null && showBtn && (
                    <TouchableOpacity onPress={onBtnPress} style={styles.iconButton}>
                        <Image source={require('../../assets/Icons/addFriendIcon.png')} style={styles.icon} />
                    </TouchableOpacity>
                )}
                {onMenuPress!==null && useMenu && (
                    <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                        <Image source={require('../../assets/Icons/menuIcon.png')} style={styles.icon} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'static',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingHorizontal: 10,
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
    titleContainer: {
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: "column",
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default CustomHeader;

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Text from './Text';
import FastImage from "react-native-fast-image";
import color from "../../styles/ColorTheme";

interface HeaderProps {
    title?:string;
    subtitle?: string;
    onBackPress?: () => void;
    onMenuPress?: () => void;
    onBtnPress?:()=>void;
    useNav?:boolean;
    useMenu?:boolean;
    useEtc?:boolean
    showBtn?:boolean; // Btn이 필요한 조건 받는 상태값
    MemberCnt?: string;
}

const CustomHeader: React.FC<HeaderProps> = ({ title, subtitle, onBackPress, onMenuPress, onBtnPress, showBtn, useNav,useEtc, useMenu, MemberCnt }) => {
    return (
        <View style={styles.headerContainer}>
            {onBtnPress!==null && useNav && (
                <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
                    <Image source={require('../../assets/Icons/goBackIcon.png')} style={styles.icon} />
                </TouchableOpacity>)
            }
            <View style={showBtn ? styles.titleContainerWithBtn: styles.titleContainer}>
                <View style={styles.rowContainer} >
                    {title && <Text variant='mainBold' children={title} />}
                    {MemberCnt &&  <Text style={styles.memberCount} children={MemberCnt}/>}
                </View>
                {subtitle && <Text variant='sub'>{subtitle}</Text>}
            </View>
            <View style={styles.rightIcons}>
                {onBtnPress!==null && showBtn && (
                    <TouchableOpacity onPress={onBtnPress} style={styles.iconButton}>
                        <FastImage source={require('../../assets/Icons/Announcement.png')} style={styles.icon} />
                    </TouchableOpacity>
                )}
                {onMenuPress!==null && useMenu && (
                    <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                        <Image source={require('../../assets/Icons/menuIcon.png')} style={styles.icon} />
                    </TouchableOpacity>
                )}
                {onMenuPress!==null && useEtc && (
                    <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                        <Image source={require('../../assets/Icons/3dotsVertical.png')} style={styles.icon} />
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
        tintColor: '#5A5A5A',
        color: '#5A5A5A'
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
    titleContainerWithBtn: {
        alignItems: 'center',
        paddingLeft: 34,
        flexDirection: "column",
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberCount: {
        fontSize: 12,
        color: '#888',
        marginLeft: 5,
    },
    rowContainer:{
        flexDirection: "row",
        flexWrap: "nowrap",
    }
});

export default CustomHeader;

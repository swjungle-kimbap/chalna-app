import React from 'react';
import { View, StyleSheet } from 'react-native';
import ImageTextButton from './Button';
import RoundBox from './RoundBox';
import { ImageSourcePropType } from 'react-native';

type NavItem = {
    icon: ImageSourcePropType;
    label: string;
    notShow?: boolean;  // Optional property to hide the button
};

// Import your icons
// import FriendIcon from '../../assets/Icons/FriendsIcon.png';
// import searchIcon from '../../assets/Icons/FriendsIcon.png';
// import notificationsIcon from './icons/notifications.png';
// import settingsIcon from './icons/settings.png';
//
// const navItems: NavItem[] = [
//     { icon: homeIcon, label: 'Home' },
//     { icon: searchIcon, label: 'Search', notShow: true },  // This item will be conditionally shown
//     { icon: notificationsIcon, label: 'Alerts' },
//     { icon: settingsIcon, label: 'Settings' },
// ];






const BottomNavigationBar: React.FC = () => {
    return (
        <RoundBox
            style={styles.navBarContainer}
            shadow={styles.shadowStyle}
        >
            <View style={styles.buttonsContainer}>
                {navItems.map((item, index) => {
                    if (!item.notShow) {  // Check if the item should be shown
                        return (
                            <ImageTextButton
                                key={index}
                                iconSource={item.icon}
                                title={item.label}
                                onPress={() => console.log(`Navigating to ${item.label}`)}
                                imageStyle={styles.iconStyle}
                                titleStyle={styles.labelStyle}
                                containerStyle={styles.buttonStyle}
                            />
                        );
                    }
                    return null;  // Return null if notShow is true
                })}
            </View>
        </RoundBox>
    );
};

const styles = StyleSheet.create({
    navBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60, // Adjust based on your needs
        borderRadius: 30, // Fully rounded sides
        backgroundColor: '#FFFFFF',
    },
    shadowStyle: {
        shadowOpacity: 0.1,
        elevation: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    iconStyle: {
        width: 24,
        height: 24,
    },
    labelStyle: {
        fontSize: 12,
        marginTop: 4,
    },
    buttonStyle: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    }
});

export default BottomNavigationBar;

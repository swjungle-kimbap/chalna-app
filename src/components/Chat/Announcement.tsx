import React, { useState, memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../common/Text';
import color from '../../styles/ColorTheme';

const Announcement = React.memo(({ message, onClose }) => {
    return (
        <View style={styles.announcementContainer}>
            <Text style={styles.announcementText}>{message}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    announcementContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8E8E8',
        marginTop:10,
        marginHorizontal:20,
        paddingTop: 12,
        paddingBottom: 6,
        paddingLeft: 15,
        paddingRight:12,
        borderRadius: 5,
        height: 'auto',
    },
    announcementText: {
        flex: 1,
        color: '#444444',
        fontSize: 14,
    },
    closeButton: {
        marginLeft: 10,
    },
    closeButtonText: {
        color: '#444444',
        fontSize: 18,
        marginBottom: 4
    },
});

export default Announcement;

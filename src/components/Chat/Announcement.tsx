import React, { useState, memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../common/Text';

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
        backgroundColor: '#C6DBDA',
        marginTop:10,
        marginHorizontal:20,
        padding: 8,
        paddingLeft: 15,
        borderRadius: 5,
        height: 'auto',
    },
    announcementText: {
        flex: 1,
        color: '#333',
        fontSize: 14,
    },
    closeButton: {
        marginLeft: 10,
    },
    closeButtonText: {
        color: '#333',
        fontSize: 18,
    },
});

export default Announcement;

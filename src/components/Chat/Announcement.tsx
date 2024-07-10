import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../common/Text';

const Announcement = ({ message, onClose }) => {
    return (
        <View style={styles.announcementContainer}>
            <Text style={styles.announcementText}>{message}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    announcementContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#C6DBDA',
        marginTop:5,
        padding: 5,
        paddingLeft: 10,
        borderRadius: 5,
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

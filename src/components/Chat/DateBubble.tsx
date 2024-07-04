// DateBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DateBubbleProps {
    date: string;
}

const DateBubble: React.FC<DateBubbleProps> = ({ date }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.dateText}>{date}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        alignSelf: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    dateText: {
        color: '#000',
        fontSize: 12,
    },
});

export default DateBubble;

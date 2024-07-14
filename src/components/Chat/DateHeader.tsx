import React, {memo} from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DateHeaderProps {
    date: string;
}

const DateHeader: React.FC<DateHeaderProps> = React.memo(({ date }) => {
    return (
        <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>{date}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    dateHeaderContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    dateHeaderText: {
        color: '#888',
        fontSize: 12,
    },
});

export default DateHeader;

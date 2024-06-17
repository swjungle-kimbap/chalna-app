import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Home = ({ navigation }) => {
    // Function to handle button press
    const handleButtonPress = () => {
        // Implement logic here for what happens when the button is pressed
        alert('환영합니다! 스치는 인연과 친구가 되어보세요!');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.heading}>Welcome to Home Screen</Text>
                <Text style={styles.text}>This is your home screen content.</Text>
                {/* Add more content here as needed */}
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Press Me"
                    onPress={handleButtonPress}
                    color="#841584" // Customize button color if needed
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Example background color
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    text: {
        fontSize: 18,
        marginBottom: 24,
    },
    buttonContainer: {
        marginBottom: 24, // Adjust spacing from bottom as needed
    },
});

export default Home;

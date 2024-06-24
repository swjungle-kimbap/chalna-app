// BottomDrawer.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface BottomDrawerProps {
    visible: boolean;
    onClose: () => void;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({ visible, onClose }) => {
    return (
        <Modal
            transparent
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.button} onPress={() => { /* Button 1 action */ }}>
                        <Text style={styles.buttonText}>Button 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => { /* Button 2 action */ }}>
                        <Text style={styles.buttonText}>Button 2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => { /* Button 3 action */ }}>
                        <Text style={styles.buttonText}>Button 3</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginVertical: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default BottomDrawer;

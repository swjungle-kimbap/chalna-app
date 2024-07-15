import React from 'react';
import { Modal, TouchableWithoutFeedback, StyleSheet, View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Button from '../../components/common/Button';

interface NavigationModalProps {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    navigation: StackNavigationProp<RootStackParamList, '친구 목록'>;
}

const NavigationModal: React.FC<NavigationModalProps> = ({ modalVisible, setModalVisible, navigation }) => {
    return (
        <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Button
                            title="친구요청 목록"
                            style={styles.button}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('Tabs', { screen: '친구요청 목록' });
                            }}
                        />
                        <Button
                            title="차단친구 목록"
                            style={styles.button}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('Tabs', { screen: '차단친구 목록' });
                            }}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        ...shadowStyles,
    },
    button: {
        marginBottom: 20,
    },
});

const shadowStyles = {
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
};

export default NavigationModal;

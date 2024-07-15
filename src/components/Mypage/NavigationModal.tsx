import React from 'react';
import { Modal, TouchableWithoutFeedback, StyleSheet, View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import {Friend, RootStackParamList} from '../../interfaces';
import Button from '../../components/common/Button';
import FriendsStack from "../../navigation/FriendsStack";
import {navigate} from "../../navigation/RootNavigation";
import color from '../../styles/ColorTheme';

interface NavigationModalProps {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    navigation?: StackNavigationProp<RootStackParamList, '친구 목록'>;
    requestCount?: number;
}


const NavigationModal: React.FC<NavigationModalProps> = ({ modalVisible, setModalVisible, navigation,requestCount = 0}) => {
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
                                navigate("로그인 성공", {
                                    screen: "친구",
                                    params: {
                                        screen: "친구요청 목록"
                                    }
                                    
                                })
                            }}
                        />
                        {requestCount > 0 &&
                    <View style={styles.badge}>
                    <Text style={styles.badgeText}>{requestCount}</Text>
                    </View>}
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
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    modalContent: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 150,
        padding: 10,
        paddingLeft: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'flex-start',
        marginTop: 50,
        marginRight:10,
        ...shadowStyles,
    },
    button: {

    },
    badge: {
        backgroundColor: color.colors.main,
        borderRadius: 10,
        paddingHorizontal: 8,
        alignSelf: "center",
      },
    badgeText: {
    color: 'white',
    }
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

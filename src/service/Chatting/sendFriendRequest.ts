import axiosInstance from '../../axios/axios.instance'; // Adjust the path as necessary
import {Alert} from "react-native"; // Adjust the path as necessary


const sendFriendRequest = async (friendId: number) => {
    Alert.alert(
        "친구 요청",
        "친구 요청을 보내시겠습니까?",
        [
            {
                text: "취소",
                style: "cancel"
            },
            {
                text: "보내기",
                onPress: async () => {
                    try {
                        await axiosInstance.patch(
                            `https://chalna.shop/api/v1/relation/request/${friendId}`
                        );
                        Alert.alert("친구 요청 완료", "친구 요청을 보냈습니다.");





                    } catch (error) {
                        console.error('Failed to delete chat:', error);
                        Alert.alert("Error", "요청 전송이 실패했습니다.");
                    }
                }
            }
        ]
    );
};






export default sendFriendRequest;

import {axiosPatch} from '../axios/axios.method'; // Adjust the path as necessary
import {Alert} from "react-native";
import {urls} from "../axios/config";

export const sendFriendRequest = async (chatRoomId:string, otherId:number) => {
    Alert.alert(
        "친구 요청",
        "친구 요청을 보내시겠습니까?",
        [   { text: "취소", style: "cancel" },
                    { text: "보내기", onPress: async () => {
                        try {
                            // 친구요청 API 전송
                            const response = await axiosPatch(
                                urls.SEND_FRIEND_REQUEST_URL+`/${chatRoomId}`
                            );
                            console.log(response)
                            Alert.alert('친구 요청 성공', '친구 요청을 보냈습니다!');
                            return true;

                        } catch (error) {
                            const errorMessage = error.response?.data?.message || error.message || '친구 요청 전송이 실패했습니다.';
                            Alert.alert("Error", errorMessage);
                            return false;
                        }
                    }}
                ]
    );
};

export const acceptFriendRequest = async ({chatRoomId: string}) => {
    Alert.alert(
        '친구 요청 수락',
        '친구 요청을 수락하시겠습니까?',
        [   { text: '취소', style: 'cancel' },
                    {   text: '수락', onPress: async () => {
                        try {
                            // 요청 수락 API 전송
                            const response = await axiosPatch(
                                urls.ACCEPT_FRIEND_REQUEST_URL+`/${chatRoomId}`);
                            console.log(response);
                            Alert.alert('친구 맺기 성공', '친구가 되었습니다!');
                            return true

                        } catch (error) {
                            const errorMessage = error.response?.data?.message || error.message || '친구 요청을 수락할 수 없습니다.';
                            Alert.alert('Error', errorMessage);
                            return false // 버튼 비활성화 옵션
                        }
                    }}
                ]
    );
    return true // 성공시 버튼 비활성화
}


export const rejectFriendRequest = async ({otherId: string})  => {
    Alert.alert(
        '친구 요청 거절',
        '친구 요청을 거절하시겠습니까?',
        [   { text: '취소', style: 'cancel' },
                    {   text: '거절', onPress: async () => {
                        try {
                            const response = await axiosPatch( urls.REJECT_FRIEND_REQUEST_URL+`/${otherId}`);
                            console.log(response);
                            Alert.alert('친구 요청 거절 성공', '친구 요청을 거절했습니다.');
                            return true

                        } catch (error) {
                            const errorMessage = error.response?.data?.message || error.message || '친구 요청을 거절할 수 없습니다.';
                            Alert.alert('전송 실패', errorMessage);
                            return false
                        }
                    }}
                ]
    );
};

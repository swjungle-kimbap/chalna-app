import {axiosPatch} from '../../axios/axios.method'; // Adjust the path as necessary
import {Alert} from "react-native";
import {urls} from "../../axios/config";
import { showModal } from '../../context/ModalService';

export const sendFriendRequest = (otherId: number): Promise<boolean> => {
    return new Promise((resolve) => {
    
        showModal(
            "친구 요청",
            "친구 요청을 보내시겠습니까?",
            async () => {
              try {
                const response = await axiosPatch(`${urls.SEND_FRIEND_REQUEST_URL}${otherId}`);
                console.log(response);
                showModal('친구 요청', '친구 요청을 보냈습니다!', () => {}, undefined, false);
                resolve(true);
              } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || '친구 요청 전송이 실패했습니다.';
                showModal("찰나가 아파요..", errorMessage, () => {}, undefined, false);
                resolve(false);
              }
            },
            () => resolve(false),
            true,
            '요청',
            '취소'
          );
    });
};


export const acceptFriendRequest = async (otherId: number, chatRoomId: number) => {
    return new Promise((resolve) => {
        showModal(
            '친구 요청 수락',
            '친구 요청을 수락하시겠습니까?',
            async () => {
              try {
                const response = await axiosPatch(
                  urls.ACCEPT_FRIEND_REQUEST_URL + `${otherId}`,
                  "친구요청 전송", { chatRoomId: chatRoomId }
                );
                console.log(response);
                showModal('친구 맺기 성공', '친구가 되었습니다!', () => {}, undefined, false);
                resolve(true);
              } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || '친구 요청을 수락할 수 없습니다.';
                showModal('찰나가 아파요..', errorMessage, () => {}, undefined, false);
                resolve(false);
              }
            },
            () => resolve(false),
            true,
            '수락',
            '취소'
          );
    });
};

export const rejectFriendRequest = async (otherId: number) => {
    return new Promise((resolve) => {
        showModal(
            '친구 요청 거절',
            '친구 요청을 거절하시겠습니까?',
            async () => {
              try {
                const response = await axiosPatch(urls.REJECT_FRIEND_REQUEST_URL + `${otherId}`);
                console.log(response);
                showModal('친구 요청 거절 성공', '친구 요청을 거절했습니다.', () => {}, undefined, false);
                resolve(true);
              } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || '친구 요청을 거절할 수 없습니다.';
                showModal('찰나가 아파요..', errorMessage, () => {}, undefined, false);
                resolve(false);
              }
            },
            () => resolve(false),
            true,
            '거절',
            '취소'
          );
    });
};



export const deleteFriend = async (otherId: number) => {
    return new Promise((resolve) => {

        showModal(
            '친구 삭제',
            '친구를 삭제하시겠습니까?',
            async () => {
              try {
                const response = await axiosPatch(urls.DELETE_FRIEND_URL + `${otherId}`);
                console.log(response);
                showModal('친구 삭제 성공', '', () => {}, undefined, false);
                resolve(true);
              } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || '친구 삭제에 실패했습니다 다시 시도해주세요.';
                showModal('찰나가 아파요..', errorMessage, () => {}, undefined, false);
                resolve(false);
              }
            },
            () => resolve(false),
            true,
            '친구 삭제',
            '취소'
          );
    });
};


export const blockFriend = async (otherId: number) => {
    return new Promise((resolve) => {

        showModal(
            '친구 차단',
            '친구를 차단하시겠습니까?',
            async () => {
              try {
                const response = await axiosPatch(urls.BLOCK_FRIEND_URL + `${otherId}`);
                console.log(response);
                showModal('친구 차단 성공', '', () => {}, undefined, false);
                resolve(true);
              } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || '친구 차단이 실패했습니다 다시 시도해주세요.';
                showModal('전송 실패', errorMessage, () => {}, undefined, false);
                resolve(false);
              }
            },
            () => resolve(false),
            true,
            '친구 차단',
            '취소'
          );
    });
};


export const unblockFriend = async (otherId: number) => {
    return new Promise((resolve) => {
        showModal(
            '친구 차단 해제',
            '친구를 차단 해체하시겠습니까?',
            async () => {
              try {
                const response = await axiosPatch(urls.UNBLOCK_FRIEND_URL + `${otherId}`);
                console.log(response);
                showModal('친구 차단 해제 성공', '', () => {}, undefined, false);
                resolve(true);
              } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || '친구 차단 해제가 실패했습니다 다시 시도해주세요.';
                showModal('전송 실패', errorMessage, () => {}, undefined, false);
                resolve(false);
              }
            },
            () => resolve(false),
            true,
            '해제',
            '취소'
          );
    });
};

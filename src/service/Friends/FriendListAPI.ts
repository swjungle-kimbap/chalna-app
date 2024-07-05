import {axiosGet} from '../../axios/axios.method'; // Adjust the path as necessary
import {urls} from "../../axios/config";
import {friend} from "../../interfaces/Friend.type";


export const fetchFriendList = async ():Promise<friend[]|null> => {

    const response = await axiosGet(
        urls.GET_FRIEND_LIST_URL,
        "친구목록 조회 실패"
    )
    return response.data.data.friends
}

export const fetchFriendRelation = async (otherId: number):Promise<friend|null> => {
    const response = await axiosGet(
        urls.GET_FRIEND_LIST_URL + `/${otherId}`
    )
    return response.data.data
}

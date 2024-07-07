import {axiosGet} from '../../axios/axios.method'; // Adjust the path as necessary
import {urls} from "../../axios/config";
import {friend, friendAPIResponse} from "../../interfaces/Friend.type";


export const fetchFriendList = async ():Promise<friend[]> => {
    const response = await axiosGet<friendAPIResponse>(
        urls.GET_FRIEND_LIST_URL
    )
    console.log("response data: ", response.data.data);
    return response.data.data
}

export const fetchFriendRelation = async (otherId: number):Promise<friend|null> => {
    const response = await axiosGet(
        urls.GET_FRIEND_LIST_URL + `/${otherId}`
    )
    return response.data.data
}

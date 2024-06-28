import Config from 'react-native-config';

const API_BASE_URL = Config.API_BASE_URL;

const getFullUrl = (path: string): string => `${API_BASE_URL}${path}`;

export const urls = {
    LOGIN_URL: getFullUrl(Config.LOGIN_PATH),
    SIGNUP_URL: getFullUrl(Config.SIGNUP_PATH),
    LOGOUT_URL: getFullUrl(Config.LOGOUT_PATH),

    userInfoQueryUrl: getFullUrl(Config.USER_INFO_QUERY_PATH),
    userInfoEditUrl: getFullUrl(Config.USER_INFO_EDIT_PATH),
    withdrawalUrl: getFullUrl(Config.WITHDRAWAL_PATH),
    getAppSettingUrl: getFullUrl(Config.GET_APP_SETTING_PATH),
    setAppSettingUrl: getFullUrl(Config.SET_APP_SETTING_PATH),
    tagListQueryUrl: getFullUrl(Config.TAG_LIST_QUERY_PATH),
    addTagUrl: getFullUrl(Config.ADD_TAG_PATH),
    deleteTagUrl: getFullUrl(Config.DELETE_TAG_PATH),
    deleteAllTagsUrl: getFullUrl(Config.DELETE_ALL_TAGS_PATH),
    getRelationUrl: getFullUrl(Config.GET_RELATION_PATH),
    setRelationCntUrl: getFullUrl(Config.SET_RELATION_CNT_PATH),
    friendQueryUrl: getFullUrl(Config.FRIEND_QUERY_PATH),
    getFriendListUrl: getFullUrl(Config.GET_FRIEND_LIST_PATH),
    requestFriendUrl: getFullUrl(Config.REQUEST_FRIEND_PATH),
    getFriendRelationUrl: getFullUrl(Config.GET_FRIEND_RELATION_PATH),
    deleteFriendUrl: getFullUrl(Config.DELETE_FRIEND_PATH),
    blockFriendUrl: getFullUrl(Config.BLOCK_FRIEND_PATH),
    sendMsgUrl: getFullUrl(Config.SEND_MSG_PATH),
    getMsgListUrl: getFullUrl(Config.GET_MSG_LIST_PATH),
    acceptMsgUrl: getFullUrl(Config.ACCEPT_MSG_PATH),
    deleteMsgUrl: getFullUrl(Config.DELETE_MSG_PATH),
    deleteAllMsgUrl: getFullUrl(Config.DELETE_ALL_MSG_PATH),
    getChatListUrl: getFullUrl(Config.GET_CHAT_LIST_PATH),
    getChatUrl: getFullUrl(Config.GET_CHAT_PATH),
    setLeaveTimeUrl: getFullUrl(Config.SET_LEAVE_TIME_PATH),
    setCurPosUrl: getFullUrl(Config.SET_CUR_POS_PATH),
};

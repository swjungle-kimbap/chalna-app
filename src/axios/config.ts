import Config from 'react-native-config';

const BASE_URL = Config.BASE_URL;
const API_BASE_URL = Config.API_BASE_URL;

const getFullUrl = (path: string): string => `${BASE_URL}${API_BASE_URL}${path}`;

export const urls = {
    LOGIN_URL: getFullUrl(Config.LOGIN_PATH),
    SIGNUP_URL: getFullUrl(Config.SIGNUP_PATH),
    LOGOUT_URL: getFullUrl(Config.LOGOUT_PATH),

    USER_INFO_QUERY_URL: getFullUrl(Config.MEMBER_PATH),
    USER_INFO_EDIT_URL: getFullUrl(Config.MEMBER_PATH),
    WITHDRAWAL_URL: getFullUrl(Config.MEMBER_PATH),

    GET_APP_SETTING_URL: getFullUrl(Config.APP_SETTING_PATH),
    SET_APP_SETTING_URL: getFullUrl(Config.APP_SETTING_PATH),

    TAG_LIST_QUERY_URL: getFullUrl(Config.APP_SETTING_TAG_PATH),
    ADD_TAG_URL: getFullUrl(Config.APP_SETTING_TAG_PATH),
    DELETE_TAG_URL: getFullUrl(Config.APP_SETTING_TAG_PATH),
    DELETE_ALL_TAGS_URL: getFullUrl(Config.APP_SETTING_TAG_PATH),

    GET_RELATION_URL: getFullUrl(Config.RELATION_PATH),
    SET_RELATION_CNT_URL: getFullUrl(Config.RELATION_PATH),
    FRIEND_QUERY_URLL: getFullUrl(Config.RELATION_PATH),
    SEND_FRIEND_REQUEST_URL: getFullUrl(Config.RELATION_REQUEST_PATH),
    ACCEPT_FRIEND_REQUEST_URL: getFullUrl(Config.RELATION_ACCEPT_PATH),
    REJECT_FRIEND_REQUEST_URL: getFullUrl(Config.RELATION_REJECT_PATH),

    GET_FRIEND_LIST_URL: getFullUrl(Config.FRIEND_PATH),
    // REQUEST_FRIEND_URL: getFullUrl(Config.FRIEND_PATH),
    // GET_FRIEND_RELATION_URL : getFullUrl(Config.FRIEND_PATH),
    DELETE_FRIEND_URL: getFullUrl(Config.FRIEND_PATH),
    // BLOCK_FRIEND_URL : getFullUrl(Config.FRIEND_PATH),

    SEND_MSG_URL: getFullUrl(Config.MATCH_MSG_PATH),
    GET_MSG_LIST_URL: getFullUrl(Config.MATCH_MSG_PATH),
    ACCEPT_MSG_URL: getFullUrl(Config.MATCH_MSG_ACCEPT_PATH),
    DELETE_MSG_URL: getFullUrl(Config.MATCH_MSG_REJECT_PATH),
    DELETE_ALL_MSG_URL: getFullUrl(Config.MATCH_MSG_REJECT_PATH),

    CHATROOM_LIST_URL: getFullUrl(Config.CHATROOM_PATH),
    CHATROOM_MSG_URL: getFullUrl(Config.CHATROOM_CHAT_MSG_PATH),
    CHATROOM_LEAVE_URL: getFullUrl(Config.CHATROOM_LEAVE_PATH),

    SET_CUR_POS_URL: getFullUrl(Config.SET_CUR_POS_PATH),


};

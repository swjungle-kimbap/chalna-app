import Config from "react-native-config";
import {MMKV, MMKVConfiguration} from "react-native-mmkv";

const FILE_DIRECTORY = '/data/data/com.chalna/files';

const LoginMMKVConfig: MMKVConfiguration = {
    id:'loginInfo',
    path: FILE_DIRECTORY + '/login/',
    encryptionKey: Config.encryptionKey
};
export const loginMMKVStorage = new MMKV(LoginMMKVConfig)

export let userMMKVStorage: MMKV | null = null;

export const setUserMMKVStorage = (userId:string) => {
    userMMKVStorage = new MMKV({
        id: `user_${userId}`,
        path: FILE_DIRECTORY + `/users/user_${userId}`,
    });
    console.log(`MMKV storage set to user_${userId}`);
};

export const setMMKVString = (key: string, value: string) => {
    userMMKVStorage.set(key, value);
    console.log(`${key} stored ${value} in MMKV`);
};

export const setMMKVObject = <T>(key: string, value: T) => {
    const jsonValue = JSON.stringify(value);
    userMMKVStorage.set(key, jsonValue);
    console.log(`${key} stored in MMKV`);
};

export const getMMKVString = (key: string):string|null => {
    const value = userMMKVStorage.getString(key);
    if (value === null) {
        console.log(`${key} is not stored in MMKV`);
        return null;
    }
    console.log(`Using stored ${key} : ${value} in MMKV`);
    return value;
};

export const getMMKVObject = <T>(key: string): T | null => {
    const jsonValue = userMMKVStorage.getString(key);
    if (jsonValue != null) {
        console.log(`Using stored ${key} : ${jsonValue} in MMKV`);
        return JSON.parse(jsonValue);
    }
    console.log(`${key} is not stored in MMKV`);
    return null;
};

export const removeMMKVItem = (key: string) => {
    userMMKVStorage.delete(key);
    console.log(`Removed ${key} completely in MMKV`);
};

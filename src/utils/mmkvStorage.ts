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
    if (value === undefined) {
        console.log(`${key} is not stored in MMKV`);
        return null;
    }
    console.log(`Using stored ${key} : ${value} in MMKV`);
    return value;
};

export const getMMKVObject = <T>(key: string): T | null => {
    const jsonValue = userMMKVStorage.getString(key);
    if (jsonValue !== undefined) {
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


// 기본 저장소에서 가져오는 함수들 추가

// 기본 MMKV 저장소
export const defaultMMKVStorage = new MMKV();

// 기본 저장소에 값 설정
export const setDefaultMMKVString = (key: string, value: string) => {
    defaultMMKVStorage.set(key, value);
    console.log(`${key} stored ${value} in default MMKV`);
};

// 기본 저장소에 Boolean 값 설정
export const setDefaultMMKVBoolean = (key: string, value: boolean) => {
    defaultMMKVStorage.set(key, value);
    console.log(`${key} stored ${value} in default MMKV`);
};

// 기본 저장소에 객체 설정
export const setDefaultMMKVObject = <T>(key: string, value: T) => {
    const jsonValue = JSON.stringify(value);
    defaultMMKVStorage.set(key, jsonValue);
    console.log(`${key} stored in default MMKV`);
};

// 기본 저장소에서 문자열 값 가져오기
export const getDefaultMMKVString = (key: string): string | null => {
    const value = defaultMMKVStorage.getString(key);
    if (value === undefined) {
        console.log(`${key} is not stored in default MMKV`);
        return null;
    }
    console.log(`Using stored ${key} : ${value} in default MMKV`);
    return value;
};

// 기본 저장소에서 Boolean 값 가져오기
export const getDefaultMMKVBoolean = (key: string): boolean | null => {
    const value = defaultMMKVStorage.getBoolean(key);
    if (value === undefined) {
        console.log(`${key} is not stored in default MMKV`);
        return null;
    }
    console.log(`Using stored ${key} : ${value} in default MMKV`);
    return value;
};

// 기본 저장소에서 객체 값 가져오기
export const getDefaultMMKVObject = <T>(key: string): T | null => {
    const jsonValue = defaultMMKVStorage.getString(key);
    if (jsonValue !== undefined) {
        console.log(`Using stored ${key} : ${jsonValue} in default MMKV`);
        return JSON.parse(jsonValue);
    }
    console.log(`${key} is not stored in default MMKV`);
    return null;
};

// 기본 저장소에서 항목 삭제
export const removeDefaultMMKVItem = (key: string) => {
    defaultMMKVStorage.delete(key);
    console.log(`Removed ${key} completely in default MMKV`);
};
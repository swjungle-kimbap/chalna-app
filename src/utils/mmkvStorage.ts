import {MMKV} from "react-native-mmkv";

const mmkvStorage = new MMKV({id:'mmkvStorage'});

export const setMMKVString =  (key: string, value: string) => {
    try {
        mmkvStorage.set(key, value);
        console.log(`${key} stored ${value} in MMKV`);
    } catch (e) {
        console.log(`Error storing ${key} key: `, e);
    }
};

export const setMMKVObject = <T>(key: string, value: T) => {
    try {
        const jsonValue = JSON.stringify(value);
        mmkvStorage.set(key, jsonValue);
        console.log(`${key} stored in MMKV`);
    } catch (e) {
        console.log(`Error storing ${key} key: `, e);
    }
};

export const getMMKVString = (key: string):string|null => {
    try {
        const value = mmkvStorage.getString(key);
        if (value === null) {
            console.log(`${key} is not stored in MMKV`);
            return null;
        }
        console.log(`Using stored ${key} : ${value} in MMKV`);
        return value;
    } catch (e) {
        console.log(`Error retrieving ${key} key: `, e);
        return null;
    }
};

export const getMMKVObject = <T>(key: string): T | null => {
    try {
        const jsonValue = mmkvStorage.getString(key);
        if (jsonValue != null) {
            console.log(`Using stored ${key} : ${jsonValue} in MMKV`);
            return JSON.parse(jsonValue);
        }
        console.log(`${key} is not stored in MMKV`);
        return null;
    } catch (e) {
        console.log(`Error retrieving ${key} key: `, e);
        return null;
    }
};

export const removeMMKVItem = (key: string) => {
    try {
        mmkvStorage.delete(key);
        console.log(`Removed ${key} completely in MMKV`);
    } catch (e) {
        console.log(`Error removing ${key} key: `, e);
    }
};
import AsyncStorage from '@react-native-async-storage/async-storage';

const setAsyncString = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`${key} stored in AsyncStorage`);
  } catch (e) {
    console.log(`Error storing ${key} key: `, e);
  }
};

const setAsyncObject = async (key: string, value: object) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`${key} stored in AsyncStorage`);
  } catch (e) {
    console.log(`Error storing ${key} key: `, e);
  }
};

const getAsyncString = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      console.log(`Using stored ${key} in AsyncStorage`);
      return ''
    } 
    console.log(`${key} is not stored in AsyncStorage`);
    return value
      
  } catch (e) {
    console.log(`Error retrieving ${key} key: `, e);
  }
};

const getAsyncObject = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue != null) {
      console.log(`Using stored ${key} in AsyncStorage`);
      return JSON.parse(jsonValue);
    }
    console.log(`${key} is not stored in AsyncStorage`);
    return null;
  } catch (e) {
    console.log(`Error retrieving ${key} key: `, e);
  }
};

const removeAsyncItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key)
    console.log(`Remove ${key} compeletly in AsyncStorage`);
  } catch(e) {
    // remove error
    console.log(`Error removing ${key} key: `, e);
  }
}
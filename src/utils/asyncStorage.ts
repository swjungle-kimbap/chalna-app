import AsyncStorage from '@react-native-async-storage/async-storage';

export const setAsyncString = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    //console.log(`${key} stored ${value} in AsyncStorage`);
  } catch (e) {
    console.log(`Error storing ${key} key: `, e);
  }
};

export const setAsyncObject = async <T>(key: string, value: T) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    //console.log(`${key} stored in AsyncStorage`);
  } catch (e) {
    console.log(`Error storing ${key} key: `, e);
  }
};

export const getAsyncString = async (key: string):Promise<string> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      console.log(`${key} is not stored in AsyncStorage`);
      return ''
    } 
    //console.log(`Using stored ${key} : ${value} in AsyncStorage`);
    return value
      
  } catch (e) {
    console.log(`Error retrieving ${key} key: `, e);
    return ''
  }
};

export const getAsyncObject = async <T>(key: string):Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue != null) {
      //console.log(`Using stored ${key} : ${jsonValue} in AsyncStorage`);
      return JSON.parse(jsonValue);
    }
    console.log(`${key} is not stored in AsyncStorage`);
    return null;
  } catch (e) {
    console.log(`Error retrieving ${key} key: `, e);
    return null;
  }
};

export const removeAsyncItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key)
    console.log(`Remove ${key} compeletly in AsyncStorage`);
  } catch(e) {
    // remove error
    console.log(`Error removing ${key} key: `, e);
  }
}

export const removeOneAsyncItem = async <T extends { id: string }>(key: string, id: string): Promise<void> => {
  try {
    const existingObjects = await getAsyncObject<T[]>(key);
    if (existingObjects === null) {
      return;
    }

    const filteredObjects = existingObjects.filter(Object => Object.id !== id);
    if (filteredObjects.length === 0) {
      await removeAsyncItem(key);
    } else {
      await setAsyncObject(key, filteredObjects);
    }

    console.log(`Deleted message with id ${id} from ${key}`);
  } catch (error) {
    console.error(`Error deleting message with id ${id} from ${key}:`, error);
  }
};
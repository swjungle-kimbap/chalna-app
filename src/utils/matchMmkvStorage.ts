import {  setMMKVObject, getMMKVObject, getCurrentUserId } from '../utils/mmkvStorage';


// 초기화
const matchDeviceIdListKey = 'matchDeviceIdList';

setMMKVObject(matchDeviceIdListKey, []);

const addToDeviceIdList = (deviceId: string) => {
  const currentList = getMMKVObject<string[]>(matchDeviceIdListKey) || [];
  if (!currentList.includes(deviceId)) {
    currentList.push(deviceId);
    setMMKVObject(matchDeviceIdListKey, currentList);
  }
};


const removeFromDeviceIdList = (deviceId: string) => {
  let currentList = getMMKVObject<string[]>(matchDeviceIdListKey) || [];
  currentList = currentList.filter(id => id !== deviceId);
  setMMKVObject(matchDeviceIdListKey, currentList);
};

const getDeviceIdList = (): string[] => {
  return getMMKVObject<string[]>(matchDeviceIdListKey) || [];
};

// 5분 후 삭제 로직
const scheduleDeviceIdRemoval = (deviceId: string) => {
  setTimeout(() => {
    removeFromDeviceIdList(deviceId);
    console.log(`Scheduled removal of ${deviceId} from matchDeviceIdList`);
  }, 5 * 60 * 1000); // 5분 = 300000ms
};

// 조회 예시
const checkDeviceId = (deviceId: string) => {
  const currentList = getDeviceIdList();
  return currentList.includes(deviceId);
};

export { addToDeviceIdList, removeFromDeviceIdList, getDeviceIdList, scheduleDeviceIdRemoval, checkDeviceId };
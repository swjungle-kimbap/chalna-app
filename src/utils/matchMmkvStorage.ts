import { setMMKVObject, getMMKVObject, getCurrentUserId, setUserMMKVStorage } from '../utils/mmkvStorage';

export const deviceObjectStorage = 'deviceObjectStorage';

export interface DeviceObject {
  deviceId: string;
  lastSendAt: string;
}


export const addDeviceIDList = async (deviceId: string, lastSendAt:string): Promise<void> => {
  try {
    const existingDeviceObjects = getMMKVObject<DeviceObject[]>(deviceObjectStorage) || [];
    const existingDeviceIndex = existingDeviceObjects.findIndex(obj => obj.deviceId === deviceId);

    if (existingDeviceIndex !== -1) {
      existingDeviceObjects[existingDeviceIndex].lastSendAt = lastSendAt;
    } else {
      existingDeviceObjects.push({
        deviceId: deviceId,
        lastSendAt: lastSendAt,
      });
    }

    // 업데이트된 목록 저장
    setMMKVObject(deviceObjectStorage, existingDeviceObjects);
    console.log(`Stored deviceId message for user ${getCurrentUserId()}:`, deviceId, lastSendAt);

  } catch (error) {
    console.error(`Error storing deviceId message for user ${getCurrentUserId()}:`, error);
  }
};



export const checkDeviceId = async (deviceId: string): Promise<boolean> => {
  try {
    const existingDeviceObjects = getMMKVObject<DeviceObject[]>(deviceObjectStorage) || [];
    const existingDevice = existingDeviceObjects.find(obj => obj.deviceId === deviceId);

    if (!existingDevice) {
      return false;
    }

    const lastSendAt = new Date(existingDevice.lastSendAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSendAt.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    return diffMinutes < 5;
  } catch (error) {
    console.error(`Error checking deviceId message for user ${getCurrentUserId()}:`, error);
    return false;
  }
};
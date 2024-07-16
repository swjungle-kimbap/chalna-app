import { setMMKVObject, getMMKVObject, getCurrentUserId, setUserMMKVStorage } from '../utils/mmkvStorage';

export const deviceObjectStorage = 'deviceObjectStorage';

export interface DeviceObject {
  deviceId: string;
  lastSendAt: string;
}

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export const addDeviceIDList = async (deviceIds: string[]): Promise<void> => {
  try {
    const now = new Date().getTime()
    const existingDeviceObjects = getMMKVObject<DeviceObject[]>(deviceObjectStorage) || [];
    const filteredObjects = existingDeviceObjects.filter(device => {
      const lastSendAt = new Date(device.lastSendAt).getTime();
      return (now - lastSendAt) <= FIVE_MINUTES_IN_MS;
    });

    const lastSendAt = new Date(now + FIVE_MINUTES_IN_MS).toISOString();
    deviceIds.forEach((deviceId) => {
      const existingDeviceIndex = filteredObjects.findIndex(obj => obj.deviceId === deviceId);
      if (existingDeviceIndex !== -1) {
        filteredObjects[existingDeviceIndex].lastSendAt = lastSendAt;
      } else {
        filteredObjects.push({
          deviceId: deviceId,
          lastSendAt: lastSendAt,
        });
      }
    })
    
    // 업데이트된 목록 저장
    setMMKVObject(deviceObjectStorage, filteredObjects);
  } catch (error) {
    console.error(`Error storing deviceId message `, error);
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
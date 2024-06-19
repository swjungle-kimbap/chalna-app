import { Platform } from 'react-native';
import { PERMISSIONS, request, requestMultiple, 
  requestLocationAccuracy, check, checkMultiple, Permission } from 'react-native-permissions'; 

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    try {
      // iOS 권한 확인
      const status = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
      if (status !== 'granted') { // 권한이 없는 경우에만 요청
        const newStatus = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);

        if (newStatus === 'granted') {
          try {
            const accuracy = await requestLocationAccuracy({
              purposeKey: 'common-purpose',
            });
            console.log(`Location accuracy is: ${accuracy}`);
            return true;
          } catch (e: any) {
            console.error(`Location accuracy request has been failed: ${e}`);
          }
        } else {
          console.error(`Location permission denied or blocked: ${newStatus}`);
        }
      } else {
        console.log('Location permission already granted.');
        return true;
      }
    } catch (e: any) {
      console.error(`Location request has been failed: ${e}`); 
    }
    return false;
  }

  if (Platform.OS === 'android') {
    try {
      // Android 권한 확인
      const statuses = await checkMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      ]);

      const permissionsToRequest: Array<Permission> = [];

      // 필요한 권한만 요청하도록 필터링
      if (statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !== 'granted') {
        permissionsToRequest.push(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
      if (statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] !== 'granted') {
        permissionsToRequest.push(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
      }
      if (permissionsToRequest.length === 0){
        console.log('Location permissions already granted.');
        return true;
      }
        
      // 권한 요청 (필요한 경우에만)
      if (permissionsToRequest.length > 0) {
        const newStatuses = await requestMultiple(permissionsToRequest);
        console.log(`Location request status:`, newStatuses);
        if (newStatuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === 'granted'
           && newStatuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] === 'granted')
          return true;
      } else {
        console.log('Location permissions has been denied or blocked');
      }
    } catch (e: any) {
      console.error(`Location request has been failed: ${e}`);
    }
    return false;
  }
};
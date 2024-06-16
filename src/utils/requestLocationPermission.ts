import { Platform } from 'react-native';
import { PERMISSIONS, request, requestMultiple, requestLocationAccuracy } from 'react-native-permissions';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    try {
      const status = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      if (status === 'granted') {
        try {
          const accuracy = await requestLocationAccuracy({
            purposeKey: 'common-purpose', // Replace with your purposeKey
          });
          console.log(`Location accuracy is: ${accuracy}`);
        } catch (e: any) { // Explicitly type any for the error object
          console.error(`Location accuracy request has been failed: ${e}`);
        }
      }
    } catch (e: any) {
      console.error(`Location request has been failed: ${e}`);
    }
  }

  if (Platform.OS === 'android') {
    try {
      const statuses = await requestMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      ]);
      console.log(`Location request status:`, statuses); // Log all status values
    } catch (e: any) {
      console.error(`Location request has been failed: ${e}`);
    }
  }
};



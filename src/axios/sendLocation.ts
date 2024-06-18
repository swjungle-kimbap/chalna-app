import axios from 'axios';
import { apiUrl } from '../config/config';
import { Position, LocationData, TestResponse } from '../interfaces';

const sendLocation = async (id: string, currentLocation : Position) : Promise<TestResponse> => { 
  try {
    // Define the interface for the request body
    const response = await axios.post(apiUrl, {
      userUUID: id,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      distance: 300,
    } as LocationData); // Ensure data is type-safe
    console.log('Device ID sent successfully:', response.data);
    return response.data;

  } catch (error: any) { // Use any type for the error object
    console.error('Error sending device ID:', error);
    
    throw error;
  }

};

export default sendLocation; // Export the function
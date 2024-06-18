import * as Keychain from 'react-native-keychain';

interface KeychainCredentials {
  service: string;
  username?: string; 
  password: string;
}

export async function storeToken(token:string) {
  try {
    await Keychain.setGenericPassword('fcmToken', token);
    console.log('fcmToken stored in keychain');
  } catch (error) {
    console.log('Error storing token: ', error);
  }
}

export async function retrieveToken(): Promise<string | null> {
  try {
    const credentials: KeychainCredentials | false 
      = await Keychain.getGenericPassword({ service: 'fcmToken' });
    if (credentials) {
      return credentials.password;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null
  }
}


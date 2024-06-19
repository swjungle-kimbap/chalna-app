import * as Keychain from 'react-native-keychain';

interface KeychainCredentials {
  service: string;
  username?: string; 
  password: string;
}

export async function setKeychain(service:string, token:string) {
  try {
    await Keychain.setGenericPassword(service, token);
    console.log(`${service} stored in keychain`);
  } catch (error) {
    console.log(`Error storing ${service} token: `, error);
  }
}

export async function getKeychain(service:string): Promise<string | null> {
  try {
    const credentials: KeychainCredentials | false 
      = await Keychain.getGenericPassword({service});
    if (credentials) {
      return credentials.password;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving ${service} token:`, error);
    return null
  }
}

export async function deleteKeychain(service:string): Promise<void> {
  try {
    await Keychain.resetGenericPassword({service});
    console.log(`${service} token deleted successfully`);
  } catch (error) {
    console.error(`Error deleting ${service} token`, error);
  }
};
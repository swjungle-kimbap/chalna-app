import * as Keychain from 'react-native-keychain';

interface KeychainCredentials {
  username: string; 
  password: string;
  service?: string;
}

const SERVICE_PREFIX = 'com.chalna';

export async function setKeychain(username: string, password: string) {
  try {
    await Keychain.setGenericPassword(username, password, { service: `${SERVICE_PREFIX}.${username}` });
    console.log(`${username} stored in keychain`);
  } catch (error) {
    console.log(`Error storing ${username} token: `, error);
  }
}

export async function getKeychain(username: string): Promise<string | null> {
  try {
    const credentials: KeychainCredentials | false 
      = await Keychain.getGenericPassword({ service: `${SERVICE_PREFIX}.${username}` });
    if (credentials) {
      console.log(`Using stored ${username} ${credentials.password}`);
      return credentials.password;
    } else {
      console.log(`Not stored ${username} in keychain`);
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving ${username} token:`, error);
    return null;
  }
}

export async function deleteKeychain(username: string): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: `${SERVICE_PREFIX}.${username}` });
    console.log(`${username} token deleted successfully`);
  } catch (error) {
    console.error(`Error deleting ${username} token`, error);
  }
}

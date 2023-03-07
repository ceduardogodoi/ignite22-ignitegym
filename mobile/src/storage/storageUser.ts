import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserDTO } from '@dtos/UserDTO';
import { USER_STORAGE } from '@storage/storageConfig'

export async function storageUserSave(user: UserDTO) {
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
}

export async function storageUserGet(): Promise<UserDTO> {
  const storage = await AsyncStorage.getItem(USER_STORAGE);
  return storage ? JSON.parse(storage) : {};
}

export async function storageUserRemove() {
  await AsyncStorage.removeItem(USER_STORAGE);
}

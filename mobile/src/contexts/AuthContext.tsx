import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '@services/api';
import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from '@storage/storageAuthToken';
import { storageUserSave, storageUserGet, storageUserRemove } from '@storage/storageUser';
import { UserDTO } from '@dtos/UserDTO';

export type AuthContextDataProps = {
  user: UserDTO;
  signIn(email: string, password: string): Promise<void>;
  updateUserProfile(userUpdated: UserDTO): Promise<void>;
  signOut(): Promise<void>;
  isLoadingUserStorageData: boolean;
};

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

type AuthContextProviderProps = {
  children: ReactNode;
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState({} as UserDTO);
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

  function userAndTokenUpdate(userData: UserDTO, token: string) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
  }

  async function storageUserAndTokenSave(userData: UserDTO, token: string) {
    setIsLoadingUserStorageData(true);

    await storageUserSave(userData);
    await storageAuthTokenSave(token);

    setIsLoadingUserStorageData(false);
  }

  async function signIn(email: string, password: string) {
    setIsLoadingUserStorageData(true);

    const { data } = await api.post('/sessions', { email, password });
    if (data.user && data.token) {
      await storageUserAndTokenSave(data.user, data.token);
      userAndTokenUpdate(data.user, data.token);
    }

    setIsLoadingUserStorageData(false);
  }

  async function signOut() {
    setIsLoadingUserStorageData(true);

    setUser({} as UserDTO);
    await storageUserRemove();
    await storageAuthTokenRemove();

    setIsLoadingUserStorageData(false);
  }

  async function updateUserProfile(userUpdated: UserDTO) {
    setUser(userUpdated);

    await storageUserSave(userUpdated);
  }

  async function loadUserData() {
    setIsLoadingUserStorageData(true);

    const userLogged = await storageUserGet();
    const token = await storageAuthTokenGet();
    if (token && userLogged) {
      userAndTokenUpdate(userLogged, token);
    }

    setIsLoadingUserStorageData(false);
  }

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
      updateUserProfile,
      signOut,
      isLoadingUserStorageData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '@services/api';
import { storageAuthTokenSave } from '@storage/storageAuthToken';
import { storageUserSave, storageUserGet, storageUserRemove } from '@storage/storageUser';
import { UserDTO } from '@dtos/UserDTO';

export type AuthContextDataProps = {
  user: UserDTO;
  signIn(email: string, password: string): Promise<void>;
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

  async function storageUserAndToken(userData: UserDTO, token: string) {
    setIsLoadingUserStorageData(true);

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    await storageUserSave(userData);
    await storageAuthTokenSave(token);

    setUser(userData);

    setIsLoadingUserStorageData(false);
  }

  async function signIn(email: string, password: string) {
    const { data } = await api.post('/sessions', { email, password });
    if (data.user && data.token) {
      storageUserAndToken(data.user, data.token);
    }
  }

  async function signOut() {
    setIsLoadingUserStorageData(true);
    setUser({} as UserDTO);
    await storageUserRemove();

    setIsLoadingUserStorageData(false);
  }

  async function loadUserData() {
    const userLogged = await storageUserGet();
    if (userLogged) {
      setUser(userLogged);
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
      signOut,
      isLoadingUserStorageData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

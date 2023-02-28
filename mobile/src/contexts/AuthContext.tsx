import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '@services/api';
import { storageUserSave, storageUserGet } from '@storage/storageUser';
import { UserDTO } from '@dtos/UserDTO';

export type AuthContextDataProps = {
  user: UserDTO;
  signIn(email: string, password: string): Promise<void>;
  isLoadingUserStorageData: boolean;
};

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

type AuthContextProviderProps = {
  children: ReactNode;
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState({} as UserDTO);
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

  async function signIn(email: string, password: string) {
    const { data } = await api.post('/sessions', { email, password });
    if (data.user) {
      setUser(data.user);
      storageUserSave(data.user);
    }
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
      isLoadingUserStorageData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

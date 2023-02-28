import { createContext, ReactNode, useState } from 'react';
import { api } from '@services/api';
import { storageUserSave } from '@storage/storageUser';
import { UserDTO } from '@dtos/UserDTO';

export type AuthContextDataProps = {
  user: UserDTO;
  signIn(email: string, password: string): Promise<void>;
};

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

type AuthContextProviderProps = {
  children: ReactNode;
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState({} as UserDTO);

  async function signIn(email: string, password: string) {
    const { data } = await api.post('/sessions', { email, password });
    if (data.user) {
      setUser(data.user);
      storageUserSave(data.user);
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

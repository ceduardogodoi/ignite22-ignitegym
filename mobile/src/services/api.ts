import axios, { AxiosInstance } from 'axios';
import { AppError } from '@utils/AppError';

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager(signOut: SignOut): () => void;
};

export const api = axios.create({
  baseURL: 'http://192.168.1.4:3333',
}) as APIInstanceProps;

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use(response => response, error => {
    if (error.response?.data) {
      return Promise.reject(new AppError(error.response.data.message));
    }

    return Promise.reject(error);
  });

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
}

import axios, { AxiosError, AxiosInstance } from 'axios';
import { AppError } from '@utils/AppError';

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager(signOut: SignOut): () => void;
};

export const api = axios.create({
  baseURL: 'http://192.168.1.4:3333',
}) as APIInstanceProps;

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use(response => response, (requestError: AxiosError<{ message: string }>) => {
    if (requestError?.response?.status === 401) {
      if (
        requestError.response.data?.message === 'token.expired' ||
        requestError.response.data?.message === 'token.invalid'
      ) {
        // TODO: próxima aula
      }

      signOut();
    }

    if (requestError.response?.data) {
      return Promise.reject(new AppError(requestError.response.data.message));
    }

    return Promise.reject(requestError);
  });

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
}

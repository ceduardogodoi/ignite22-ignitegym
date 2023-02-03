import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://192.168.1.5:3333',
});

api.interceptors.response.use(response => {
  return response;
}, error => {
  return Promise.reject(error);
});

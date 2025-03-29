import axios from 'axios';
import { getToken } from '../store/authStore';


const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, 
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

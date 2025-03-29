import axios from 'axios'
import { BASE_URL } from './apiPath'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})


axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token')
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)



axiosInstance.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if(error.response){
            if(error.response.status === 401){
                window.location.href="/signin"
            } else if (error.response.status === 500){
                console.error("Server error, please try again")
            }else if(error.code === "ECONNABORTED"){
                console.error("Request Timeout, Please try again")
            }
        }
        return Promise.reject(error)
    }
)


axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

export default axiosInstance

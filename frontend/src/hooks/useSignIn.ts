import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';


export interface SignInData {
  email: string;
  password: string;
}

export interface SignInResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImageUrl: string;
    organization?: string;
  };
}

export const useSignIn = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<SignInResponse, any, SignInData, unknown>({
    mutationFn: async (data: SignInData) => {
      const response = await axiosInstance.post('/auth/sign-in', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
};

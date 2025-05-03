import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  invitationCode?: string;
  profileImage?: FileList;
}

export interface SignUpResponse {
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

export const useSignUp = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<SignUpResponse, any, FormData, unknown>({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post('/auth/sign-up', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
};
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

  return useMutation<SignUpResponse, any, SignUpData, unknown>({
    mutationFn: async (data: SignUpData) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      if (data.invitationCode) {
        formData.append('invitationCode', data.invitationCode);
      }
      if (data.profileImage && data.profileImage.length > 0) {
        formData.append('image', data.profileImage[0]);
      }
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

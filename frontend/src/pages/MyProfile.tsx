import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useOrganizationStore } from '../store/organizationStore';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../layouts/DashboardLayout';
import toast from "react-hot-toast";

import { FaSpinner } from 'react-icons/fa'; 
import { MdCloudUpload } from 'react-icons/md'; 

interface MyProfileForm {
  name: string;
  password?: string;
  profileImage?: FileList;
  organizationName?: string;
}

const MyProfile: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const { orgName, setOrgName } = useOrganizationStore();
  const { register, handleSubmit, setValue } = useForm<MyProfileForm>({
    defaultValues: {
      name: user?.name || '',
      organizationName: orgName || '',
    },
  });
  const [preview, setPreview] = useState<string>(user?.profileImageUrl || '');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); 
  const [fileInputKey] = useState<number>(Math.random());

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setPreview(user.profileImageUrl || '');
      if (user.role === 'admin') {
        setValue('organizationName', orgName);
      }
    }
  }, [user, setValue, orgName]);

  const onSubmit = async (data: MyProfileForm) => {
    try {
      setIsSubmitting(true); 
      const formData = new FormData();

      // Update organization name (admin only)
      if (user?.role === 'admin' && data.organizationName && data.organizationName !== orgName) {
        await axiosInstance.put('/org/update-name', { name: data.organizationName });
        setOrgName(data.organizationName);
      }

      // Update user profile
      formData.append('name', data.name);
      if (data.password) formData.append('password', data.password);
      if (data.profileImage?.[0]) formData.append('image', data.profileImage[0]);

      const response = await axiosInstance.put('/auth/profile', formData);
      setAuth(response.data.token || useAuthStore.getState().token || '', response.data.user);

      if (response.data.user.profileImageUrl) {
        setPreview(response.data.user.profileImageUrl);
      }

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false); 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setValue('profileImage', e.target.files);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    fileInput?.click();
  };

  const renderProfileImage = () => {
    if (preview) {
      return (
        <img
          src={preview}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover"
        />
      );
    }

    const initials = user?.name?.split(' ').map(word => word[0]).join('') || '';
    return (
      <div className={`w-32 h-32 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
        <span className="text-4xl text-white">{initials}</span>
      </div>
    );
  };

  return (
    <DashboardLayout activeMenu="Profile">
      <div className={`max-w-xl mx-auto p-6 mt-6 rounded-lg shadow-md ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className="mb-6 flex flex-col items-center">
            {renderProfileImage()}

            <div className="flex items-center mt-4 cursor-pointer" onClick={handleUploadClick}>
              <MdCloudUpload className="text-3xl mr-2 text-blue-500" />
              <span className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Update Profile Image
              </span>
            </div>

            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              key={fileInputKey} 
            />
          </div>

          {user?.role === 'admin' && (
            <div className="mb-4">
              <label className="block mb-1">Organization Name</label>
              <input
                type="text"
                {...register('organizationName')}
                className={`w-full p-2 border rounded-lg focus:outline-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full p-2 border rounded-lg focus:outline-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Password (leave blank to keep unchanged)</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full p-2 border rounded-lg focus:outline-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className={`w-full p-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-gray-200 border-gray-300 text-gray-700'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                Updating...
              </span>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
        {message && <p className={`mt-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{message}</p>}
      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
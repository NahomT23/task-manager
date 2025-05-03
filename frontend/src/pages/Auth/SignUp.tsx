import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BsCloudUpload } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import { SignUpSchema } from '../../formSchemas/authFormSchema';
import { z } from 'zod';
import { useThemeStore } from '../../store/themeStore';
import { useSignUp } from '../../hooks/useSignUp';
import { useSignIn } from '../../hooks/useSignIn';

type FormData = z.infer<typeof SignUpSchema>;

const GUEST_EMAIL = import.meta.env.VITE_API_GUEST_EMAIL;
const GUEST_PASSWORD = import.meta.env.VITE_API_GUEST_PASSWORD;

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();

  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm<FormData>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onChange',
  });

  const signUpMutation = useSignUp();
  const signInMutation = useSignIn();
  const profileImage = watch('profileImage');

  const isLoading = signUpMutation.isPending || signInMutation.isPending;

  const onSubmit = (data: FormData) => {
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

    signUpMutation.mutate(formData, {
      onSuccess: (data) => {
        const role = data.user.role;
        navigate(role === 'admin' ? '/admin/dashboard' 
          : role === 'member' ? '/user/dashboard' 
          : role === 'idle' ? '/setup' 
          : '/');
      },
    });
  };

  const signInAsGuest = () => {
    signInMutation.mutate(
      { email: GUEST_EMAIL, password: GUEST_PASSWORD },
      { 
        onSuccess: (data) => {
          const role = data.user.role;
          navigate(role === 'admin' ? '/admin/dashboard' 
            : role === 'member' ? '/user/dashboard' 
            : role === 'idle' ? '/setup' 
            : '/');
        }
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-5 rounded-lg shadow-sm w-full max-w-[360px]">
        <h2 className="text-xl font-semibold mb-5 text-center text-gray-800">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="Enter your name"
              className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode ? 'text-black' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode ? 'text-black' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
                className={`block w-full px-3 py-2 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode ? 'text-black' : ''}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Invitation Code */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Invitation Code (optional)</label>
            <input
              type="text"
              {...register('invitationCode')}
              placeholder="Enter invitation code if available"
              className={`block w-full px-3 py-2 border ${errors.invitationCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode ? 'text-black' : ''}`}
            />
            {errors.invitationCode && <p className="text-red-500 text-xs mt-1">{errors.invitationCode.message}</p>}
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Profile Image (optional)</label>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="profileImage"
                className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 
                          rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <BsCloudUpload size={16} className="text-gray-500" />
                <span className="text-xs text-gray-600">Upload</span>
              </label>
              <input
                type="file"
                id="profileImage"
                {...register('profileImage')}
                className="hidden"
                accept="image/*"
              />
              {profileImage?.length > 0 && (
                <span className="text-xs text-gray-500 truncate">{profileImage[0].name}</span>
              )}
            </div>

          </div>

          {/* Error Message */}
          {(signUpMutation.error || signInMutation.error) && (
            <p className="text-red-500 text-xs mt-2">
              {(signUpMutation.error as any)?.response?.data?.message 
                || (signInMutation.error as any)?.response?.data?.message 
                || 'An error occurred'}
            </p>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg transition-all duration-200 
                      ${!isValid || isLoading 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:bg-blue-700 active:scale-95'}`}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>

          {/* Sign In as Guest Button */}
          <button
            type="button"
            onClick={signInAsGuest}
            disabled={isLoading}
            className={`w-full mt-2 py-2.5 px-4 rounded-lg transition-all duration-200 
                      ${isLoading 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 border border-blue-200'}`}
          >
            {isLoading ? 'Signing In...' : 'Sign In as Guest'}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="mt-4 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
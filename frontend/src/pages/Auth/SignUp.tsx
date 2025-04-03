import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BsCloudUpload } from 'react-icons/bs'; // New import
import { Link, useNavigate } from 'react-router-dom';
import { SignUpSchema } from '../../formSchemas/authFormSchema';
import { useSignUp } from '../../hooks/useSignUp';
import { z } from 'zod';

type FormData = z.infer<typeof SignUpSchema>;

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // New state
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isValid }, setValue } = useForm<FormData>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onChange',
  });

  const { mutate, status, error } = useSignUp();
  const isLoading = status === 'pending';

  const onSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: (data) => {
        const role = data.user.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'member') {
          navigate('/user/dashboard');
        } else if (role === 'idle') {
          navigate('/setup');
        } else {
          navigate('/');
        }
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);

      setValue('profileImage', e.target.files);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-[360px]">
        <h2 className="text-xl font-semibold mb-5 text-center text-gray-800">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="Enter your name"
              className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
                    <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
                className={`block w-full px-3 py-2 pr-10 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={18} className="text-gray-500" />
                ) : (
                  <AiOutlineEye size={18} className="text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Invitation Code */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Invitation Code (optional)</label>
            <input
              type="text"
              {...register('invitationCode')}
              placeholder="Enter invitation code if available"
              className={`block w-full px-3 py-2 border ${errors.invitationCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
            />
            {errors.invitationCode && <p className="text-red-500 text-xs mt-1">{errors.invitationCode.message}</p>}
          </div>

          {/* Profile Image */}
<div>
  <label className="block text-sm font-medium text-gray-600 mb-1">Profile Image (optional)</label>
  
  {/* Hidden actual file input */}
  <input
    type="file"
    id="profileImage"
    {...register('profileImage')}
    onChange={handleFileChange}
    className="hidden"
    accept="image/*"
  />
  
  {/* Custom upload button */}
  <div className="flex items-center space-x-3">
    <label
      htmlFor="profileImage"
      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 
                rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <BsCloudUpload size={18} className="text-gray-500" />
      <span className="text-sm text-gray-600">Upload image</span>
    </label>
    

    {selectedFile && (
      <span className="text-sm text-gray-500 truncate">
        {selectedFile.name}
      </span>
    )}
  </div>
  
  {errors.profileImage && (
    <p className="text-red-500 text-xs mt-1">{error?.profileImage}</p>
  )}
</div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-xs mt-2">
              {(error as any)?.response?.data?.message || 'An error occurred'}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full bg-black text-white py-2 px-4 rounded-lg transition-colors duration-200 
              ${!isValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
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
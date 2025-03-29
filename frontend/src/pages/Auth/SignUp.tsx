import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { SignUpSchema } from '../../formSchemas/authFormSchema';
import { useSignUp } from '../../hooks/useSignUp';
import { z } from 'zod';

type FormData = z.infer<typeof SignUpSchema>;

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
          {/* Name */}
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="Enter your name"
              className={`mt-1 block w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          {/* Email */}
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={`mt-1 block w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          {/* Password */}
          <div className="relative">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter your password"
              className={`mt-1 block w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {/* Invitation Code */}
          <div>
            <label className="block text-gray-700">Invitation Code (optional)</label>
            <input
              type="text"
              {...register('invitationCode')}
              placeholder="Enter invitation code if available"
              className={`mt-1 block w-full p-2 border ${errors.invitationCode ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.invitationCode && <p className="text-red-500 text-sm mt-1">{errors.invitationCode.message}</p>}
          </div>
          {/* Profile Image */}
          <div>
            <label className="block text-gray-700">Profile Image (optional)</label>
            <input
              type="file"
              {...register('profileImage')}
              className={`mt-1 block w-full p-2 border ${errors.profileImage ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              accept="image/*"
            />
            {errors.name?.message && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}

          </div>
          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">
              {(error as any)?.response?.data?.message || 'An error occurred'}
            </p>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full bg-blue-500 text-white p-2 rounded transition-colors duration-200 ${!isValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

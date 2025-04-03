import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from '../../hooks/useSignIn';

const SignInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
type FormData = z.infer<typeof SignInSchema>;

const Signin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(SignInSchema),
    mode: 'onChange',
  });

  const { mutate, status, error } = useSignIn();
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-[360px]">
        <h2 className="text-xl font-semibold mb-5 text-center text-gray-800">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
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

          {/* Password Input */}
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
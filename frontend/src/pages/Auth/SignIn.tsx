import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from '../../hooks/useSignIn';
import { useThemeStore } from '../../store/themeStore';
import { SignInSchema } from '../../formSchemas/authFormSchema';


type FormData = z.infer<typeof SignInSchema>;

const GUEST_EMAIL = import.meta.env.VITE_API_GUEST_EMAIL
const GUEST_PASSWORD = import.meta.env.VITE_API_GUEST_PASSWORD


const Signin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(SignInSchema),
    mode: 'onChange',
  });

  const { mutate, status, error } = useSignIn();
  const isLoading = status === 'pending';

  const handleSuccess = (data: any) => {
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
  };

  const onSubmit = (data: FormData) => {
    mutate(data, { onSuccess: handleSuccess });
  };

  const signInAsGuest = () => {
    mutate(
      { email: GUEST_EMAIL, password: GUEST_PASSWORD },
      { onSuccess: handleSuccess }
    );
  };

  // return (
  //   <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
  //     <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-[360px]">
  //       <h2 className="text-xl font-semibold mb-5 text-center text-gray-800">Sign In</h2>
  //       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  //         {/* Email Input */}
  //         <div>
  //           <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
  //           <input
  //             type="email"
  //             {...register('email')}
  //             placeholder="Enter your email"
  //             className={`block w-full px-3 py-2 border ${isDarkMode ? 'text-black' : ''} ${
  //               errors.email ? 'border-red-500' : 'border-gray-300'
  //             } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
  //           />
  //           {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
  //         </div>

  //         {/* Password Input */}
  //         <div className="relative">
  //           <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
  //           <div className="relative">
  //             <input
  //               type={showPassword ? 'text' : 'password'}
  //               {...register('password')}
  //               placeholder="Enter your password"
  //               className={`block w-full px-3 py-2 pr-10 border ${isDarkMode ? 'text-black' : ''} ${
  //                 errors.password ? 'border-red-500' : 'border-gray-300'
  //               } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
  //             />
  //             <button
  //               type="button"
  //               className="absolute right-3 top-1/2 -translate-y-1/2"
  //               onClick={() => setShowPassword((v) => !v)}
  //             >
  //               {showPassword ? (
  //                 <AiOutlineEyeInvisible size={18} className="text-gray-500" />
  //               ) : (
  //                 <AiOutlineEye size={18} className="text-gray-500" />
  //               )}
  //             </button>
  //           </div>
  //           {errors.password && (
  //             <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
  //           )}
  //         </div>

  //         {/* API Error Message */}
  //         {error && (
  //           <p className="text-red-500 text-xs mt-2">
  //             {(error as any)?.response?.data?.message || 'An error occurred'}
  //           </p>
  //         )}

  //         {/* Sign In Button */}
  //         <button
  //           type="submit"
  //           disabled={!isValid || isLoading}
  //           className={`w-full bg-black text-white py-2 px-4 rounded-lg transition-colors duration-200 ${
  //             !isValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
  //           }`}
  //         >
  //           {isLoading ? 'Signing In...' : 'Sign In'}
  //         </button>

  //         {/* Sign In as Guest Button */}
  //         <button
  //           type="button"
  //           onClick={signInAsGuest}
  //           disabled={isLoading}
  //           className={`w-full mt-2 ${
  //             isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
  //           } bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200`}
  //         >
  //           {isLoading ? 'Signing In...' : 'Sign In as Guest'}
  //         </button>
  //       </form>

  //       {/* Sign Up Link */}
  //       <p className="mt-4 text-center text-sm text-gray-600">
  //         Don&apos;t have an account?{' '}
  //         <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
  //           Sign up
  //         </Link>
  //       </p>
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-[400px]">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={`block w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode ? 'text-black' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
                className={`block w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode ? 'text-black' : ''}`}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* API Error Message */}
          {error && (
            <p className="text-red-500 text-sm mt-3">
              {(error as any)?.response?.data?.message || 'An error occurred'}
            </p>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg transition-all duration-200 ${
              !isValid || isLoading 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Sign In as Guest Button */}
          <button
            type="button"
            onClick={signInAsGuest}
            disabled={isLoading}
            className={`w-full mt-3 py-3 px-4 rounded-lg transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 border border-blue-200'
            }`}
          >
            {isLoading ? 'Signing In...' : 'Sign In as Guest'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-5 text-center text-sm text-gray-600">
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

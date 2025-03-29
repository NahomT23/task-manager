// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
// import { Link } from "react-router-dom";
// import { SignInSchema } from "../../formSchemas/authFormSchema";

// type FormData = z.infer<typeof SignInSchema>;

// const Signin: React.FC = () => {
//   const [showPassword, setShowPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isValid },
//   } = useForm<FormData>({
//     resolver: zodResolver(SignInSchema),
//     mode: "onChange",
//   });

//   const onSubmit = (data: FormData) => {
//     console.log(data)
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//       <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           {/* Email Input */}
//           <div>
//             <label className="block text-gray-700">Email</label>
//             <input
//               type="email"
//               {...register("email")}
//               placeholder="Enter your email"
//               className={`mt-1 block w-full p-2 border ${
//                 errors.email ? "border-red-500" : "border-gray-300"
//               } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             {errors.email && (
//               <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//             )}
//           </div>
//           {/* Password Input */}
//           <div className="relative">
//             <label className="block text-gray-700">Password</label>
//             <input
//               type={showPassword ? "text" : "password"}
//               {...register("password")}
//               placeholder="Enter your password"
//               className={`mt-1 block w-full p-2 border ${
//                 errors.password ? "border-red-500" : "border-gray-300"
//               } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             />
//             <div
//               className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? (
//                 <AiOutlineEyeInvisible size={20} />
//               ) : (
//                 <AiOutlineEye size={20} />
//               )}
//             </div>
//             {errors.password && (
//               <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//             )}
//           </div>
//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={!isValid}
//             className={`w-full bg-blue-500 text-white p-2 rounded transition-colors duration-200 ${
//               !isValid
//                 ? "opacity-50 cursor-not-allowed"
//                 : "hover:bg-blue-600"
//             }`}
//           >
//             Sign In
//           </button>
//         </form>
//         {/* Link to Signup */}
//         <p className="mt-4 text-center text-gray-600">
//           Don&apos;t have an account?{" "}
//           <Link to="/signup" className="text-blue-500 hover:underline">
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signin;

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

  // Destructure the mutation result and derive loading state from status.
  const { mutate, status, error } = useSignIn();
  const isLoading = status === 'pending';

  const onSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: (data) => {
        // Role-based redirection based on the user's role.
        const role = data.user.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'member') {
          navigate('/user/dashboard');
        } else if (role === 'idle') {
          navigate('/setup');
        } else {
          navigate('/'); // Fallback redirection
        }
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={`mt-1 block w-full p-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          {/* Password Input */}
          <div className="relative">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter your password"
              className={`mt-1 block w-full p-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
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
            className={`w-full bg-blue-500 text-white p-2 rounded transition-colors duration-200 ${
              !isValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;

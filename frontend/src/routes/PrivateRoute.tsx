import { useAuthStore } from '../store/authStore';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

export default PrivateRoutes;
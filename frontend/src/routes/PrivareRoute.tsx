import { Outlet, Navigate } from "react-router-dom"

interface PrivateRoutesProps {
  allowedRoles: string[]; 
}

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({ allowedRoles }) => {
  
  const userRole = "admin";

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />; 
  }

  return <Outlet />; 
}

export default PrivateRoutes;

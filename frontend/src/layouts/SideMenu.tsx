import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect } from "react";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../utils/data";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface SideMenuProps {
  activeMenu: string;
}

const SideMenu = ({ activeMenu }: SideMenuProps) => {
  const { user } = useAuthStore();
  const [sideMenuData, setSideMenuData] = useState<MenuItem[]>([]);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleClick = (route: string) => {
    if (route === "logout") {
      handleLogout();
    }
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(user?.role === 'admin' ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA);
    }
  }, [user]);

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
        <div className="relative">

{user?.profileImageUrl ? (
  <img 
    src={user.profileImageUrl} 
    alt="Profile" 
    className="w-20 h-20 bg-slate-400 rounded-full"
  />
) : (

  <div className="w-20 h-20 bg-slate-400 rounded-full flex items-center justify-center">
    <span className="text-white">No Image</span>
  </div>
)}


          
        </div>
        {user?.role === "admin" && (
          <div className="text-[10px] font-medium text-white bg-blue-600 px-3 py-0.5 rounded mt-1">
            Admin
          </div>
        )}
        <h5 className="text-gray-950 font-medium leading-6 mt-3">
          {user?.name || ""}
        </h5>
        <p className="text-[12px] text-gray-500">
          {user?.email || ""}
        </p>
      </div>

      {sideMenuData.map((item, index) => (
        <button 
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] ${
            activeMenu === item.label 
              ? "text-blue-600 bg-gradient-to-r from-blue-50/40 to-blue-100/50 border-r-3 border-blue-500" 
              : ""
          } py-3 px-6 cursor-pointer`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default SideMenu;
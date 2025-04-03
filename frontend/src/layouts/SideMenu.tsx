import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect } from "react";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../utils/data";
import { useThemeStore } from "../store/themeStore";

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
  const { isDarkMode } = useThemeStore();
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
    } else {
      navigate(route);
    }
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(user?.role === 'admin' ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA);
    }
  }, [user]);

  return (
    <div className={`w-64 h-[calc(100vh-61px)] ${
      isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200/50'
    } border-r sticky top-[61px] z-20`}>
      
      <div className="flex flex-col items-center justify-center mb-7 pt-5">

<div className="relative">
  {user?.profileImageUrl ? (
    <img 
      src={user.profileImageUrl} 
      alt="Profile" 
      className={`w-20 h-20 rounded-full ${isDarkMode ? 'border-gray-600' : 'bg-slate-400'}`}
    />
  ) : (
    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
      isDarkMode ? 'bg-pink-400' : 'bg-pink-400'
    }`}>
      <span className={`font-medium text-xl uppercase ${
        isDarkMode ? 'text-gray-300' : 'text-white'
      }`}>
        {user?.name?.split(' ').slice(0, 2).map(word => word[0]).join('') || ''}
      </span>
    </div>
  )}
</div>

        {user?.role === "admin" && (
          <div className={`text-[10px] font-medium px-3 py-0.5 rounded mt-1 ${
            isDarkMode ? 'bg-blue-700 text-gray-100' : 'bg-blue-600 text-white'
          }`}>
            Admin
          </div>
        )}

        <h5 className={`font-medium leading-6 mt-3 ${
          isDarkMode ? 'text-white' : 'text-gray-950'
        }`}>
          {user?.name || ""}
        </h5>
        <p className={`text-[12px] ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {user?.email || ""}
        </p>
      </div>

      {sideMenuData.map((item, index) => (
        <button 
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 cursor-pointer transition-colors duration-200 ${
            activeMenu === item.label 
              ? `${
                  isDarkMode 
                    ? 'text-blue-400 bg-gradient-to-r from-blue-900/20 to-blue-900/10 border-blue-400'
                    : 'text-blue-600 bg-gradient-to-r from-blue-50/40 to-blue-100/50 border-blue-500'
                } border-r-3`
              : `${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-800/50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
          }`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon className={`text-xl ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`} />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default SideMenu;
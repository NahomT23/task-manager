import { useState, useEffect } from "react";
import SideMenu from "./SideMenu";
import { HiOutlineMenu, HiOutlineX, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { useOrganizationStore } from "../store/organizationStore"
import axiosInstance from "../api/axiosInstance";

interface NavbarProps {
  activeMenu: string;
}

const Navbar = ({ activeMenu }: NavbarProps) => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const { user } = useAuthStore();
  const { orgName, setOrgName } = useOrganizationStore(); 

  useEffect(() => {
    const fetchOrganization = async () => {
      if (user?.organization && !orgName) { 
        try {

          const response = await axiosInstance.get(`/org/${user.organization}`);
          setOrgName(response.data.name);
        } catch (error) {
          console.error('Error fetching organization:', error);
        }
      }
    };
  
    fetchOrganization();
  }, [user?.organization, orgName, setOrgName]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);
  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50
      flex items-center gap-5 backdrop-blur-[2px] py-4 px-7 border-b
      ${isDarkMode 
        ? 'bg-black border-gray-800' 
        : 'bg-white/90 border-gray-200/50'
      }
    `}>
      <button
        className={`
          block lg:hidden text-2xl transition-colors
          ${isDarkMode 
            ? 'text-gray-100 hover:text-gray-300' 
            : 'text-gray-700 hover:text-gray-900'
          }
        `}
        onClick={() => setOpenSideMenu(!openSideMenu)}
      >
        {openSideMenu ? <HiOutlineX /> : <HiOutlineMenu />}
      </button>
      
      <h2 className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        {orgName || <span className="animate-pulse">Loading...</span>}
      </h2>

      <button
        className={`ml-auto text-2xl transition-colors ${isDarkMode ? 'text-gray-100 hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'}`}
        onClick={toggleDarkMode}
      >
        {isDarkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
      </button>

      {openSideMenu && (
        <div className={`fixed top-[61px] left-0 right-0 z-40 lg:hidden`}>
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
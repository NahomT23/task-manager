import { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";
import Chatbot from "../pages/Admin/Chatbot";
import Chat from '../components/chat/Chatbox'

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenu: string;
}

const DashboardLayout = ({ children, activeMenu }: DashboardLayoutProps) => {
  const { user } = useAuthStore();
  

  return (
    <div>
      <Navbar activeMenu={activeMenu} />
      {user && (
        <div className="flex mt-10">
          <div className="max-[1080px]:hidden">
            <SideMenu activeMenu={activeMenu} />
          </div>
          <div className="grow mx-5 mt-5">
            {children}
          </div>
        </div>
      )}
      {user?.role === 'admin' ? <Chatbot /> : <Chat/>}
    </div>
  );
};

export default DashboardLayout;

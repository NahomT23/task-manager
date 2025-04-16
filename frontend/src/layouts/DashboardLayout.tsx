import { ReactNode, useState } from "react";
import { useAuthStore } from "../store/authStore";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";
import Chatbot from "../pages/Admin/Chatbot";
import Chat from "../components/chat/Chatbox";
import { useThemeStore } from "../store/themeStore";
import { AiOutlineClose, AiOutlineMessage } from "react-icons/ai";

interface DashboardLayoutProps {
  children: ReactNode;
  activeMenu: string;
}

const DashboardLayout = ({ children, activeMenu }: DashboardLayoutProps) => {
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(true);

  const toggleChatType = () => setShowChatbot(prev => !prev);
  const handleCloseChat = () => setIsChatOpen(false);

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

      {/* Chat components in a fixed overlay container */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 z-40">
          {user?.role === 'admin' ? (
            showChatbot ? (
              <Chatbot toggle={toggleChatType} onClose={handleCloseChat} />
            ) : (
              <Chat toggle={toggleChatType} onClose={handleCloseChat} />
            )
          ) : (
            <Chat onClose={handleCloseChat} />
          )}
        </div>
      )}

      {/* Chat toggle button remains fixed */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition-all duration-300 border ${
            isDarkMode
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700"
              : "bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
          }`}
        >
          {isChatOpen ? <AiOutlineClose /> : <AiOutlineMessage />}
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;

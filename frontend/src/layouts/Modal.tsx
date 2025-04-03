import { ReactNode } from "react";
import { useThemeStore } from "../store/themeStore";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const { isDarkMode } = useThemeStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`
        rounded-lg w-full max-w-md
        ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
      `}>
        {/* Header Section */}
        <div className={`
          flex justify-between items-center p-4 border-b
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <h3 className={`
            text-lg font-semibold
            ${isDarkMode ? 'text-white' : 'text-gray-900'}
          `}>
            {title}
          </h3>
          
          <button
            onClick={onClose}
            className={`
              text-xl font-semibold transition-colors
              ${isDarkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            ×
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
import { ReactNode } from "react";
import { useThemeStore } from "../../store/themeStore";

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode; 
  color: string;
}

  const InfoCard = ({ icon, label, value, color }: InfoCardProps) => {
    const { isDarkMode } = useThemeStore();
  
    return (
      <div className={`flex items-center gap-3 p-4 rounded-lg shadow-sm border ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {label}
          </p>
          <p className={`text-lg font-semibold ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {value}
          </p>
        </div>
      </div>
    );
  };


export default InfoCard;

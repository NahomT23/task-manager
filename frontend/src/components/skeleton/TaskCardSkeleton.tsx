import { useThemeStore } from "../../store/themeStore";

const TaskCardSkeleton = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <div className={`
      rounded-xl py-4 shadow-md animate-pulse
      ${isDarkMode 
        ? 'bg-gray-900 border border-gray-800/50 shadow-gray-900/10'
        : 'bg-white border border-gray-200/50 shadow-gray-100'
      }
    `}>
      <div className="flex items-end gap-3 px-4">
        <div className={`
          w-20 h-4 rounded 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}></div>
        <div className={`
          w-24 h-4 rounded 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}></div>
      </div>

      <div className={`
        px-4 border-l-[5px] 
        ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <div className={`
          w-36 h-5 rounded mt-4 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}></div>
        <div className={`
          w-full h-3 rounded mt-2 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}></div>
        <div className={`
          w-full h-3 rounded mt-2 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}></div>
        <div className={`
          w-32 h-2 rounded mt-2 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}></div>
      </div>

      <div className="px-4 mt-3 flex justify-between items-center">
        <div className={`
          w-12 h-12 rounded-full 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}></div>
        <div className={`
          w-12 h-4 rounded 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}></div>
      </div>
    </div>
  );
};

export default TaskCardSkeleton;
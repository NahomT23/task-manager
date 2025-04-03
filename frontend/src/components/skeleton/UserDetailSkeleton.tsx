import { useThemeStore } from "../../store/themeStore";
import DashboardLayout from "../../layouts/DashboardLayout";

const UserDetailsSkeleton = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <DashboardLayout activeMenu="User Details">
      <div className={`px-4 py-6 sm:px-6 lg:px-8 ${isDarkMode && 'dark'}`}>
        {/* Back Button */}
        <div className={`
          mb-6 flex items-center 
          ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}
          text-sm
        `}>
          <div className={`
            w-5 h-5 rounded-full mr-2 animate-pulse
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
          `} />
          <div className={`
            h-4 w-16 rounded animate-pulse
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
          `} />
        </div>

        {/* User Profile Section */}
        <div className={`
          rounded-lg shadow-sm p-6 mb-8
          ${isDarkMode ? 'bg-gray-900 border border-gray-800/50' : 'bg-white'}
        `}>
          <div className="flex items-center gap-4 md:gap-6">
            <div className={`
              w-16 h-16 md:w-20 md:h-20 rounded-full animate-pulse
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
            `} />
            <div>
              <div className={`
                h-6 w-32 rounded mb-2 animate-pulse
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `} />
              <div className={`
                h-4 w-48 rounded mb-1 animate-pulse
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `} />
              <div className={`
                h-3 w-32 rounded animate-pulse
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `} />
            </div>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className={`
                rounded-lg shadow-sm p-6 flex flex-col items-center 
                space-y-2 animate-pulse
                ${isDarkMode ? 'bg-gray-900 border border-gray-800/50' : 'bg-white'}
              `}
            >
              <div className={`
                h-8 w-24 rounded
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `} />
              <div className={`
                h-4 w-16 rounded
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `} />
            </div>
          ))}
        </div>

        {/* Assigned Tasks */}
        <div className={`
          rounded-lg shadow-sm p-4 md:p-6
          ${isDarkMode ? 'bg-gray-900 border border-gray-800/50' : 'bg-white'}
        `}>
          <div className={`
            h-6 w-32 rounded mb-4 animate-pulse
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
          `} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className={`
                  rounded-lg shadow-sm p-4 animate-pulse
                  ${isDarkMode ? 'bg-gray-900/50 border border-gray-800/30' : 'bg-white'}
                `}
              >
                <div className={`
                  h-4 w-40 rounded mb-2
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                `} />
                <div className={`
                  h-4 w-32 rounded mb-2
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                `} />
                <div className={`
                  h-3 w-24 rounded
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                `} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailsSkeleton;
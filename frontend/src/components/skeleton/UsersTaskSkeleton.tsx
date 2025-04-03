import { useThemeStore } from "../../store/themeStore";

const UsersTaskSkeleton = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      <div className={`
        form-card col-span-3 animate-pulse
        ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className={`
            h-6 rounded
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
            w-1/3
          `}></div>
          <div className={`
            h-4 rounded
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
            w-24
          `}></div>
        </div>

        <div className={`
          h-6 rounded mb-4
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
        `}></div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-6 md:col-span-4">
            <div className={`
              h-6 rounded
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
            `}></div>
          </div>
          <div className="col-span-6 md:col-span-4">
            <div className={`
              h-6 rounded
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
            `}></div>
          </div>
          <div className="col-span-6 md:col-span-4">
            <div className={`
              h-6 rounded
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
            `}></div>
          </div>
        </div>

        <div className="mt-4">
          <div className={`
            h-6 rounded mb-4
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
          `}></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className={`
                  h-4 rounded w-3/4
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
                `}
              ></div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className={`
            h-6 rounded mb-4
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
          `}></div>
          <div className="space-y-2">
            {[...Array(2)].map((_, idx) => (
              <div
                key={idx}
                className={`
                  h-4 rounded w-3/4
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
                `}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTaskSkeleton;
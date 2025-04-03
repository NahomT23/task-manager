import { useThemeStore } from "../../store/themeStore";

interface SkeletonLoaderProps {
  count: number;
}

const UserCardSkeleton = ({ count }: SkeletonLoaderProps) => {
  const { isDarkMode } = useThemeStore();

  const loader = Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className={`
        p-4 rounded-xl shadow-sm animate-pulse
        ${isDarkMode 
          ? 'bg-gray-900 border border-gray-800/50' 
          : 'bg-white border border-gray-100'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-16 h-16 rounded-full 
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
          `}></div>
          <div className="space-y-2">
            <div className={`
              w-24 h-4 rounded 
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
            `}></div>
            <div className={`
              w-32 h-3 rounded 
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
            `}></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`
              h-16 rounded-lg animate-pulse 
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
            `}
          ></div>
        ))}
      </div>
    </div>
  ));

  return <>{loader}</>;
};

export default UserCardSkeleton;
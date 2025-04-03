import { useThemeStore } from "../store/themeStore";

interface LoadingProps {
  text?: string;
}

const Loading = ({ text }: LoadingProps) => {
  const { isDarkMode } = useThemeStore();

  return (
    <div className={`flex flex-col items-center justify-center h-screen ${
      isDarkMode ? 'bg-gray-950/100' : 'bg-white'
    }`}>
      <svg
        className={`animate-spin h-12 w-12 ${
          isDarkMode ? 'text-gray-300' : 'text-blue-600'
        }`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {text && (
        <p className={`mt-4 text-xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
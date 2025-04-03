interface AvatarData {
  image?: string;
  initials: string;
}

interface AvatarGroupProps {
  avatars: AvatarData[];
  maxVisible?: number;
  isDarkMode?: boolean;
}

export const getInitialsColor = (initials: string) => {

  const colors = [
    'bg-red-500 text-white',
    'bg-blue-500 text-white',
    'bg-green-500 text-white',
    'bg-yellow-500 text-gray-800',
    'bg-purple-500 text-white',
    'bg-pink-500 text-white',
    'bg-indigo-500 text-white',
  ];
  const hash = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const AvatarGroup = ({ 
  avatars, 
  maxVisible = 3, 
  isDarkMode = false 
}: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remaining = avatars.length - maxVisible;

  return (
    <div className="flex -space-x-2 ml-2">
      {visibleAvatars.map((avatar, index) => (
        avatar.image ? (
          <img
            key={index}
            src={avatar.image}
            alt={`Avatar ${index + 1}`}
            className={`w-8 h-8 rounded-full border-2 ${
              isDarkMode ? "border-gray-800" : "border-white"
            }`}
          />
        ) : (
          <div
            key={index}
            className={`w-8 h-8 rounded-full border-2 ${
              isDarkMode ? "border-gray-800" : "border-white"
            } flex items-center justify-center text-xs font-medium ${
              getInitialsColor(avatar.initials)
            }`}
          >
            {avatar.initials}
          </div>
        )
      ))}
      {remaining > 0 && (
        <div className={`w-8 h-8 rounded-full border-2 ${
          isDarkMode 
            ? "bg-gray-700 border-gray-800 text-white" 
            : "bg-gray-100 border-white text-gray-900"
        } flex items-center justify-center text-xs font-medium`}>
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
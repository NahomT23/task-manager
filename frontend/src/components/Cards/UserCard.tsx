import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../../store/themeStore";
import { getInitialsColor } from "../../layouts/AvatarGroup";


interface UserInfo {
  _id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

interface UserCardProps {
  userInfo: UserInfo;
}

const UserCard = ({ userInfo }: UserCardProps) => {
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();

  // Helper to extract initials from the user's name.
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      onClick={() => navigate(`/admin/users/${userInfo._id}`)}
      className={`p-4 rounded-xl shadow-sm border transition-shadow duration-200 cursor-pointer ${
        isDarkMode
          ? "bg-gray-900 border-gray-700 hover:shadow-gray-800/50"
          : "bg-white border-gray-100 hover:shadow-md"
      }`}
    >
      {/* User Info */}
      <div className="flex items-center gap-3">
        {userInfo.profileImageUrl ? (
          <img
            src={userInfo.profileImageUrl}
            alt={userInfo.name}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white"
          />
        ) : (
          <div
            className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-base font-medium ${getInitialsColor(
              getUserInitials(userInfo.name)
            )}`}
          >
            {getUserInitials(userInfo.name)}
          </div>
        )}
        <div>
          <p
            className={`text-sm md:text-base font-medium line-clamp-1 ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {userInfo.name}
          </p>
          <p
            className={`text-xs md:text-sm line-clamp-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {userInfo.email}
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <StatusCard
          label="Pending"
          count={userInfo.pendingTasks || 0}
          status="pending"
          isDarkMode={isDarkMode}
        />
        <StatusCard
          label="In Progress"
          count={userInfo.inProgressTasks || 0}
          status="inProgress"
          isDarkMode={isDarkMode}
        />
        <StatusCard
          label="Completed"
          count={userInfo.completedTasks || 0}
          status="completed"
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

interface StatusCardProps {
  label: string;
  count: number;
  status: "pending" | "inProgress" | "completed";
  isDarkMode: boolean;
}

const StatusCard = ({ label, count, status, isDarkMode }: StatusCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "inProgress":
        return "bg-cyan-50 border-cyan-100 text-cyan-700";
      case "completed":
        return "bg-lime-50 border-lime-100 text-lime-700";
      default:
        return "bg-violet-50 border-violet-100 text-violet-700";
    }
  };

  return (
    <div
      className={`flex flex-col items-center p-2 rounded-lg border ${
        isDarkMode ? "border-gray-700 bg-gray-800 text-gray-300" : getStatusColor()
      } transition-colors duration-200`}
    >
      <span className="text-sm md:text-base font-semibold">{count}</span>
      <span className="text-xs text-center mt-1 line-clamp-1">{label}</span>
    </div>
  );
};

export { UserCard, StatusCard };

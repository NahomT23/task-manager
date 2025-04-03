import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import DashboardLayout from "../../layouts/DashboardLayout";
import moment from "moment";
import { LuArrowLeft } from "react-icons/lu";
import { useThemeStore } from "../../store/themeStore";
import { StatusCard } from "../../components/Cards/UserCard";
import { TaskCard } from "../../components/Cards/TaskCard";
import UserDetailsSkeleton from "../../components/skeleton/UserDetailSkeleton";
import { getInitialsColor } from "../../layouts/AvatarGroup"; 

interface User {
  _id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  createdAt: string;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
  assignedTo: Array<{
    _id: string;
    profileImageUrl: string;
    name?: string;
  }>;
  attachments: string[];
  todoChecklist: Array<{ text: string; completed: boolean }>;
}

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useThemeStore();


  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get(`/users/${userId}`);
        setUser(response.data.user);
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return <UserDetailsSkeleton />;
  }

  if (!user) {
    return (
      <DashboardLayout activeMenu="User Details">
        <div className="text-red-500">User not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="User Details">
      <div className={`px-4 py-6 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-200' : ''}`}>
        <button
          onClick={() => navigate(-1)}
          className={`mb-6 flex items-center ${
            isDarkMode
              ? 'text-gray-300 hover:text-gray-100'
              : 'text-gray-600 hover:text-gray-800'
          } text-sm`}
        >
          <LuArrowLeft className="mr-2" /> Back to Users
        </button>

        {/* User Profile Section */}
        <div className={`rounded-lg shadow-sm p-6 mb-8 ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4 md:gap-6">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 ${
                  isDarkMode ? 'border-gray-800 shadow-md' : 'border-white shadow-sm'
                }`}
              />
            ) : (
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl font-medium ${getInitialsColor(
                  getUserInitials(user.name)
                )}`}
              >
                {getUserInitials(user.name)}
              </div>
            )}
            <div>
              <h1
                className={`text-xl md:text-2xl font-semibold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                {user.name}
              </h1>
              <p
                className={`text-sm md:text-base ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {user.email}
              </p>
              <p
                className={`text-sm mt-1 md:mt-2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                Member since {moment(user.createdAt).format("MMM D, YYYY")}
              </p>
            </div>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatusCard
            label="Pending Tasks"
            count={user.pendingTasks}
            status="pending"
            isDarkMode={isDarkMode}
          />
          <StatusCard
            label="In Progress"
            count={user.inProgressTasks}
            status="inProgress"
            isDarkMode={isDarkMode}
          />
          <StatusCard
            label="Completed"
            count={user.completedTasks}
            status="completed"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Assigned Tasks */}
        <div className={`rounded-lg shadow-sm p-4 md:p-6 ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h2
            className={`text-lg md:text-xl font-semibold mb-4 md:mb-6 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            Assigned Tasks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                id={task._id}
                title={task.title}
                description={task.description}
                status={task.status}
                priority={task.priority}
                dueDate={task.dueDate}
                progress={task.progress}
                assignedTo={task.assignedTo}
                attachmentCount={task.attachments?.length || 0}
                todoChecklist={task.todoChecklist}
                onClick={() => navigate(`/admin/tasks/${task._id}`)}
                createdAt={""}
              />
            ))}
            {tasks.length === 0 && (
              <p
                className={`text-sm md:text-base ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                No tasks assigned to this user
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;

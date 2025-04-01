import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import DashboardLayout from "../../layouts/DashboardLayout";
import moment from "moment";
import { LuArrowLeft } from "react-icons/lu";

import { StatusCard } from "../../components/Cards/UserCard";
import { TaskCard } from "../../components/Cards/TaskCard";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImageUrl: string;
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
    return <DashboardLayout activeMenu="User Details">Loading...</DashboardLayout>;
  }

  if (!user) {
    return <DashboardLayout activeMenu="User Details">User not found</DashboardLayout>;
  }

  return (
    <DashboardLayout activeMenu="User Details">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 text-sm"
        >
          <LuArrowLeft className="mr-2" /> Back to Users
        </button>

        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 md:gap-6">
            <img
              src={user.profileImageUrl}
              alt={user.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white shadow-sm"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{user.name}</h1>
              <p className="text-gray-600 text-sm md:text-base">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1 md:mt-2">
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
          />
          <StatusCard
            label="In Progress"
            count={user.inProgressTasks}
            status="inProgress"
          />
          <StatusCard
            label="Completed"
            count={user.completedTasks}
            status="completed"
          />
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Assigned Tasks</h2>
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
                    onClick={() => navigate(`/admin/tasks/${task._id}`)} createdAt={""}              />
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-500 text-sm md:text-base">No tasks assigned to this user</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
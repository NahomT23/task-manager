import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";

interface Task {
  _id: any;
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  createdAt: string;
  dueDate: string;
  assignedTo: { profileImageUrl: string }[];
  attachments: any[];
  completedTodoCount: number;
  todoChecklist: any[];
}

interface StatusSummary {
  All: number;
  pending: number;
  inProgress: number;
  completed: number;
}

const ManageTasks = () => {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusSummary, setStatusSummary] = useState<StatusSummary>({
    All: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/tasks', {
        params: {
          status: filterStatus === "All" ? undefined : filterStatus
        }
      });

      setTasks(response.data.tasks);
      setStatusSummary(response.data.statusSummary);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };


  const handleClick = (task: Task) => {
    navigate(`/admin/create-task/${task._id}`, { state: { task } });
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const handleDownloadReport = async () => {
    // 
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-xl font-medium">
              My Tasks
            </h2>
            <button
              onClick={handleDownloadReport}
              className="flex lg:hidden download-btn"
            >
              <LuFileSpreadsheet className="text-lg"/>
              Download Report
            </button>
          </div>

          <div className="flex items-center gap-3">
            <TaskStatusTabs
              tabs={[
                { Label: "All", count: statusSummary.All },
                { Label: "pending", count: statusSummary.pending },
                { Label: "inProgress", count: statusSummary.inProgress },
                { Label: "completed", count: statusSummary.completed },
              ]}
              activeTab={filterStatus}
              setActiveTab={setFilterStatus}
            />
            <button
              onClick={handleDownloadReport}
              className="hidden lg:flex download-btn"
            >
              <LuFileSpreadsheet className="text-lg"/>
              Download Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              priority={task.priority}
              status={task.status}
              progress={task.progress}
              createdAt={task.createdAt}
              dueDate={task.dueDate}
              assignedTo={task.assignedTo.map(user => user.profileImageUrl)}
              attachmentCount={task.attachments?.length || 0}
              completedTodo={task.completedTodoCount || 0}
              todoChecklist={task.todoChecklist || []}
              
              onClick={() => handleClick(task)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;


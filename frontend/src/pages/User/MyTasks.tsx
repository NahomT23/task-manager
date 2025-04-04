import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import { TaskCard } from "../../components/Cards/TaskCard";
import TaskCardSkeleton from "../../components/skeleton/TaskCardSkeleton";
import { useThemeStore } from "../../store/themeStore";

interface Task {
  _id: string;
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  createdAt: string;
  dueDate: string;
  assignedTo: Array<{ 
    _id: string;
    profileImageUrl: string;
    name?: string;
  }>;
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

const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusSummary, setStatusSummary] = useState<StatusSummary>({
    All: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/tasks/my-tasks", {
        params: {
          status: filterStatus === "All" ? undefined : filterStatus,
        },
      });
      setTasks(response.data.tasks);
      setStatusSummary(response.data.statusSummary);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const handleClick = (task: Task) => {
    navigate(`/user/task-details/${task._id}`);
  };



  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    });

    if (sortOption) {
      filtered.sort((a, b) => {
        switch (sortOption) {
          case "mostAssigned":
            return b.assignedTo.length - a.assignedTo.length;
          case "date":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "progress":
            return b.progress - a.progress;
          case "attachments":
            return (b.attachments?.length || 0) - (a.attachments?.length || 0);
          case "todos":
            return (b.todoChecklist?.length || 0) - (a.todoChecklist?.length || 0);
          case "dueDateLongest":
            return (new Date(b.dueDate).getTime() - new Date(b.createdAt).getTime()) - 
                   (new Date(a.dueDate).getTime() - new Date(a.createdAt).getTime());
          case "dueDateShortest":
            return (new Date(a.dueDate).getTime() - new Date(a.createdAt).getTime()) - 
                   (new Date(b.dueDate).getTime() - new Date(b.createdAt).getTime());
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [tasks, searchQuery, sortOption]);

  const handleSortSelection = (option: string) => {
    setSortOption(option);
    setIsSortPopupOpen(false);
  };

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>
              <div className="flex lg:hidden gap-2">
                
              </div>
            </div>
          
          <div className="flex gap-2">


            <input
              type="text"
              placeholder=" Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-1 border rounded-md "
            />
                        <div className="relative">
              <button
                onClick={() => setIsSortPopupOpen((prev) => !prev)}
                className={`px-2 py-4 text-xs border rounded-md ${
                  isDarkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                Sort
              </button>
              {isSortPopupOpen && (
  <div
    className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg z-10 ${
      isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
    }`}
  >
    <div className="p-3">
      <p className={`mb-2 font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
        Sort Options
      </p>
      <ul className="space-y-1">
        {[

          "date",
          "progress",
          "attachments",
          "todos",
          "dueDateLongest",
          "dueDateShortest",
        ].map((option) => (
          <li key={option}>
            <button
              onClick={() => handleSortSelection(option)}
              className={`w-full text-left px-2 py-1 rounded ${
                isDarkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-200"
              }`}
            >
              {option === "dueDateLongest"
                ? "Due Date Difference (Longest)"
                : option === "dueDateShortest"
                ? "Due Date Difference (Shortest)"
                : option === "mostAssigned"
                ? "Most Assigned To"
                : option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

            </div>

            </div>

          </div>
          <div className="flex items-center gap-3 mt-3 lg:mt-0">
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

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TaskCardSkeleton key={index} />
            ))
          ) : filteredAndSortedTasks.length > 0 ? (
            filteredAndSortedTasks.map((task) => (
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
                assignedTo={task.assignedTo.map((user) => ({
                  _id: user._id,
                  profileImageUrl: user.profileImageUrl,
                }))}
                attachmentCount={task.attachments?.length || 0}
                completedTodo={task.completedTodoCount || 0}
                todoChecklist={task.todoChecklist || []}
                onClick={() => handleClick(task)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-4">
              No tasks found matching current filters
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;
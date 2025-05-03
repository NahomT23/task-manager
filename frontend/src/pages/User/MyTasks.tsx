import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import { TaskCard } from "../../components/Cards/TaskCard";
import TaskCardSkeleton from "../../components/skeleton/TaskCardSkeleton";
import { useThemeStore } from "../../store/themeStore";
import toast from "react-hot-toast";

import { LuFileSpreadsheet } from "react-icons/lu";

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
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
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


    const handleDownloadReport = async (format: "excel" | "pdf") => {
      setIsDownloadPopupOpen(false);
      try {
        const response = await axiosInstance.get(`/reports/export/user-tasks?type=${format}`, {
                          
          responseType: "blob",
        });
  
        const extension = format === "excel" ? "xlsx" : "pdf";
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `user_report.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
  
        toast.success(`${format.toUpperCase()} report downloaded successfully!`);
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download report");
      }
    };

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col gap-4">
          {/* Header Section */}



          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>
            <div className="relative mr-5">
              <button
                onClick={() => setIsDownloadPopupOpen((prev) => !prev)}
                className={`px-2 py-1 text-xs border rounded-md ${
                  isDarkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                Download Report
              </button>
              {isDownloadPopupOpen && (
                <div
                  className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-10 ${
                    isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="p-3">
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => handleDownloadReport("excel")}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded ${
                            isDarkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <LuFileSpreadsheet className="text-lg" />
                          Excel
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleDownloadReport("pdf")}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded ${
                            isDarkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <LuFileSpreadsheet className="text-lg" />
                          PDF
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>


          
  
          {/* Search and Filters Section */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex flex-1 gap-2">
              <input
              type="text"
              placeholder=" Search.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-1 border rounded-md max-w-xs"
            />
              <div className="relative">
                <button
                  onClick={() => setIsSortPopupOpen((prev) => !prev)}
                  className={`px-2 py-4 text-xs border rounded-md max-w-xs ${
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
                          "mostAssigned",
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
  </div>
</DashboardLayout>

  );
};

export default MyTasks;
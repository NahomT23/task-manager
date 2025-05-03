import { useState, useMemo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import { TaskCard } from "../../components/Cards/TaskCard";
import toast from "react-hot-toast";
import TaskCardSkeleton from "../../components/skeleton/TaskCardSkeleton";
import { useThemeStore } from "../../store/themeStore";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

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
    profileImageUrl?: string;
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


const fetchTasks = async (
  filterStatus: string
): Promise<{ tasks: Task[]; statusSummary: StatusSummary }> => {
  const response = await axiosInstance.get("/tasks", {
    params: {
      status: filterStatus === "All" ? undefined : filterStatus,
    },
  });
  return response.data;
};

const ManageTasks = () => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();


  const { data, isLoading, isError }: UseQueryResult<
    { tasks: Task[]; statusSummary: StatusSummary },
    Error
  > = useQuery({
    queryKey: ["tasks", filterStatus],
    queryFn: () => fetchTasks(filterStatus),
  });


  const tasks: Task[] = data?.tasks ?? [];
  const statusSummary: StatusSummary = data?.statusSummary ?? {
    All: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  const handleClick = (task: Task) => {
    navigate(`/admin/create-task/${task._id}`, { state: { task } });
  };

  const handleDownloadReport = async (format: "excel" | "pdf") => {
    setIsDownloadPopupOpen(false);
    try {
      const response = await axiosInstance.get(`/reports/export/tasks?type=${format}`, {
        responseType: "blob",
      });
      const contentType = response.headers["content-type"];

      if (contentType.includes("application/json")) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            toast.error(errorData.message || "Error downloading report");
          } catch {
            toast.error("Failed to download report");
          }
        };
        reader.readAsText(response.data);
        return;
      }

      const extension = format === "excel" ? "xlsx" : "pdf";
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `task_details.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} file downloaded successfully!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading task reports, please try again");
    }
  };

  // 4. Filter & sort with typed callbacks
  const filteredAndSortedTasks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let filtered = tasks.filter((task: Task) => {
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q)
      );
    });

    if (sortOption) {
      filtered.sort((a: Task, b: Task) => {
        switch (sortOption) {
          case "mostAssigned":
            return b.assignedTo.length - a.assignedTo.length;
          case "date":
            return (
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
            );
          case "progress":
            return b.progress - a.progress;
          case "attachments":
            return (b.attachments?.length || 0) - (a.attachments?.length || 0);
          case "todos":
            return (
              (b.todoChecklist?.length || 0) -
              (a.todoChecklist?.length || 0)
            );
          case "dueDateLongest":
            return (
              new Date(b.dueDate).getTime() -
              new Date(b.createdAt).getTime() -
              (new Date(a.dueDate).getTime() -
                new Date(a.createdAt).getTime())
            );
          case "dueDateShortest":
            return (
              new Date(a.dueDate).getTime() -
              new Date(a.createdAt).getTime() -
              (new Date(b.dueDate).getTime() -
                new Date(b.createdAt).getTime())
            );
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
      <div className="my-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">My Tasks</h2>
          <div className="relative mr-5">
            <button
              onClick={() => setIsDownloadPopupOpen((p) => !p)}
              className={`px-2 py-1 text-xs border rounded-md ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-200"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              Download Report
            </button>
            {isDownloadPopupOpen && (
              <div
                className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-10 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="p-3 space-y-1">
                  {(["excel", "pdf"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleDownloadReport(fmt)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded ${
                        isDarkMode
                          ? "text-gray-200 hover:bg-gray-700"
                          : "text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      <LuFileSpreadsheet className="text-lg" />
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
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
                onClick={() => setIsSortPopupOpen((p) => !p)}
                className={`px-2 py-4 text-xs border rounded-md max-w-xs ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                Sort
              </button>
              {isSortPopupOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg z-10 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-3">
                    <p
                      className={`mb-2 font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
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
                      ].map((opt) => (
                        <li key={opt}>
                          <button
                            onClick={() => handleSortSelection(opt)}
                            className={`w-full text-left px-2 py-1 rounded ${
                              isDarkMode
                                ? "text-gray-200 hover:bg-gray-700"
                                : "text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {opt === "dueDateLongest"
                              ? "Due Date Difference (Longest)"
                              : opt === "dueDateShortest"
                              ? "Due Date Difference (Shortest)"
                              : opt === "mostAssigned"
                              ? "Most Assigned To"
                              : opt.charAt(0).toUpperCase() + opt.slice(1)}
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

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))
          ) : isError ? (
            <div className="col-span-full text-center py-8 text-red-500">
              Failed to load tasks.
            </div>
          ) : filteredAndSortedTasks.length > 0 ? (
            filteredAndSortedTasks.map((task: Task) => (
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
                assignedTo={task.assignedTo}
                attachmentCount={task.attachments.length}
                completedTodo={task.completedTodoCount}
                todoChecklist={task.todoChecklist}
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

export default ManageTasks;

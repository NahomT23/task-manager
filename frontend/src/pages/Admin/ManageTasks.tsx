import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import { TaskCard } from "../../components/Cards/TaskCard";
import { toast } from "react-toastify";
import TaskCardSkeleton from "../../components/skeleton/TaskCardSkeleton";

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

const ManageTasks = () => {
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

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/tasks", {
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
    navigate(`/admin/create-task/${task._id}`, { state: { task } });
  };

  const handleDownloadReport = async (format: 'excel' | 'pdf') => {
    try {
      const response = await axiosInstance.get(`/reports/export/tasks?type=${format}`, {
        responseType: "blob"
      });
      const contentType = response.headers['content-type'];
      
      if (contentType.includes('application/json')) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            toast.error(errorData.message || "Error downloading report");
          } catch (e) {
            toast.error("Failed to download report");
          }
        };
        reader.readAsText(response.data);
        return;
      }

      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `task_details.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("error downloading task report: ", error);
      toast.error("Error downloading task reports, please try again");
    }
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
                <button
                  onClick={() => handleDownloadReport('excel')}
                  className="flex download-btn"
                >
                  <LuFileSpreadsheet className="text-lg" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  className="flex download-btn bg-red-600 hover:bg-red-700"
                >
                  <LuFileSpreadsheet className="text-lg" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search tasks by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-md w-full max-w-md"
            />
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
            <div className="hidden lg:flex gap-2">
              <button
                onClick={() => handleDownloadReport('excel')}
                className="flex download-btn"
              >
                <LuFileSpreadsheet className="text-lg" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleDownloadReport('pdf')}
                className="flex download-btn bg-red-600 hover:bg-red-700"
              >
                <LuFileSpreadsheet className="text-lg" />
                <span>PDF</span>
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsSortPopupOpen((prev) => !prev)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Sort
              </button>
              {isSortPopupOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <p className="mb-2 font-medium">Sort Options</p>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => handleSortSelection("mostAssigned")}
                          className="w-full text-left hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          Most Assigned To
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSortSelection("date")}
                          className="w-full text-left hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          Date (Newest First)
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSortSelection("progress")}
                          className="w-full text-left hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          Progress
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSortSelection("attachments")}
                          className="w-full text-left hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          Attachments
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSortSelection("todos")}
                          className="w-full text-left hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          Todos
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSortSelection("dueDateLongest")}
                          className="w-full text-left hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          Due Date Difference (Longest)
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSortSelection("dueDateShortest")}
                          className="w-full text-left hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          Due Date Difference (Shortest)
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
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

export default ManageTasks;
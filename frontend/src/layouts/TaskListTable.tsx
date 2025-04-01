import { useState, useMemo } from "react";
import moment from "moment";

interface TaskListTableProps {
  tableData: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

interface SortConfig {
  key: string;
  direction: "ascending" | "descending";
}

const TaskListTable = ({ tableData }: TaskListTableProps) => {
  // Pagination state
  const itemsPerPage = 6
  const [currentPage, setCurrentPage] = useState<number>(1);


  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);


  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };


  const sortedData = useMemo(() => {
    let sortableData = [...tableData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof typeof a];
        let bValue = b[sortConfig.key as keyof typeof b];
        // Special case: if sorting by createdAt, compare dates
        if (sortConfig.key === "createdAt") {
          return sortConfig.direction === "ascending"
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        }
        // Default: compare as strings
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [tableData, sortConfig]);

  // Pagination logic: slice sorted data for current page
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-500 border border-green-200";
      case "pending":
        return "bg-purple-100 text-purple-500 border border-purple-200";
      case "inProgress":
        return "bg-cyan-100 text-cyan-500 border border-cyan-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-500 border border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-500 border border-orange-200";
      case "low":
        return "bg-green-100 text-green-500 border border-green-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  return (
    <div>
      <div className="overflow-x-auto p-0 rounded-lg mt-3">
        <table className="min-w-full">
          <thead>
            <tr className="text-left">
              <th
                onClick={() => requestSort("title")}
                className="cursor-pointer py-3 px-4 text-gray-800 font-medium text-[13px]"
              >
                Name {getSortIndicator("title")}
              </th>
              <th
                onClick={() => requestSort("status")}
                className="cursor-pointer py-3 px-4 text-gray-800 font-medium text-[13px]"
              >
                Status {getSortIndicator("status")}
              </th>
              <th
                onClick={() => requestSort("priority")}
                className="cursor-pointer py-3 px-4 text-gray-800 font-medium text-[13px]"
              >
                Priority {getSortIndicator("priority")}
              </th>
              <th
                onClick={() => requestSort("createdAt")}
                className="cursor-pointer py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell"
              >
                Created On {getSortIndicator("createdAt")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((task) => (
              <tr key={task.id} className="border-t border-gray-200">
                <td className="py-2 px-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden">
                  {task.title}
                </td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="py-2 px-4 text-gray-700 text-[13px] text-nowrap hidden md:table-cell">
                  {task.createdAt ? moment(task.createdAt).format("Do MMM YYYY") : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls: only render if there are more than 6 tasks */}
      {tableData.length > itemsPerPage && (
        <div className="flex items-center justify-end mt-4 space-x-2">
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Prev
            </button>
          )}
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskListTable;

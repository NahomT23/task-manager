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

const TaskListTable = ({ tableData }: TaskListTableProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-500 border border-green-200';
      case 'pending':
        return 'bg-purple-100 text-purple-500 border border-purple-200';
      case 'inProgress':
        return 'bg-cyan-100 text-cyan-500 border border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-500 border border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-500 border border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-500 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  return (
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Name</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Status</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Priority</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">Created On</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((task) => (
            <tr key={task.id} className="border-t border-gray-200">
              <td className="py-2 px-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden">
                {task.title}
              </td>
              <td className="py-2 px-4">
                <span className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="py-2 px-4">
                <span className={`px-2 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-2 px-4 text-gray-700 text-[13px] text-nowrap hidden md:table-cell">
                {task.createdAt ? moment(task.createdAt).format('Do MMM YYYY') : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;
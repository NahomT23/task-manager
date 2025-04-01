import React from "react";
import { LuPaperclip } from "react-icons/lu";
import moment from "moment";
import AvatarGroup from "../../layouts/AvatarGroup";

interface AssignedUser {
  _id: string;
  profileImageUrl: string;
  name?: string;
}

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  createdAt: string;
  dueDate: string;
  assignedTo: AssignedUser[];
  attachmentCount: number;
  onClick: () => void;
  completedTodo?: number;
  todoChecklist?: Array<{ text: string; completed: boolean }>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  priority,
  status,
  progress,
  createdAt,
  dueDate,
  assignedTo,
  attachmentCount,
  todoChecklist = [],
  onClick
}) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "inProgress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/10";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  const getPriorityTagColor = () => {
    switch (priority) {
      case "low":
        return "text-emerald-500 bg-emerald-50 border border-emerald-500/10";
      case "medium":
        return "text-amber-500 bg-amber-50 border border-amber-500/10";
      default:
        return "text-rose-500 bg-rose-50 border border-rose-500/10";
    }
  };

  const actualCompleted = todoChecklist.filter((item) => item.completed).length;
  const totalTodos = todoChecklist.length;


  // duration calulation
  const durationDays = moment(dueDate).diff(moment(createdAt), "days");

  return (
    <div
      className="bg-white rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-end gap-3 px-4">
        <div className={`text-[11px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded`}>
          {status}
        </div>

        <div className={`text-[11px] font-medium ${getPriorityTagColor()} px-4 py-0.5 rounded`}>
          {priority} Priority
        </div>
      </div>

      <div
        className={`px-4 border-l-[5px] 
          ${status === "inProgress" ? "border-cyan-500" : status === "completed" ? "border-indigo-500" : "border-violet-500"}`}
      >
        <p className="text-sm font-medium text-gray-800 mt-4 line-clamp-2">
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-[18px]">
          {description}
        </p>
        <p className="text-[13px] text-gray-700/80 font-medium mt-2 mb-2 leading-[18px]">
          Task Done{" "}
          <span className="font-semibold text-gray-700">
            {actualCompleted} / {totalTodos}
          </span>
        </p>
        <Progress progress={progress} status={status} />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between my-1">
          <div>
            <label className="text-xs text-gray-500">Start Date</label>
            <p className="text-[13px] font-medium text-gray-900">
              {moment(createdAt).format("Do MMM YYYY")}
            </p>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Due Date</label>
          <p className="text-[13px] font-medium text-gray-900">
            {moment(dueDate).format("Do MMM YYYY")}
          </p>
        </div>
        {/* New Duration Row */}
        <div className="mt-2">
          <label className="text-xs text-gray-500">Duration</label>
          <p className="text-[13px] font-medium text-gray-900">
            {durationDays} {durationDays === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 px-4">
        <AvatarGroup avatars={assignedTo.map((user) => user.profileImageUrl)} />
        {attachmentCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 px-2.5 py-1.5 rounded-lg">
            <LuPaperclip className="text-blue-900" />{" "}
            <span className="text-xs text-gray-900 ">{attachmentCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProgressProps {
  progress: number;
  status: string;
}

const Progress: React.FC<ProgressProps> = ({ progress, status }) => {
  const getColor = () => {
    switch (status) {
      case "inProgress":
        return "bg-cyan-500";
      case "completed":
        return "bg-indigo-500";
      default:
        return "bg-violet-500";
    }
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div
        className={`${getColor()} h-1.5 rounded-full transition-all duration-300`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export { Progress };

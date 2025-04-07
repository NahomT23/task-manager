import React from "react";
import { LuPaperclip } from "react-icons/lu";
import moment from "moment";
import AvatarGroup from "../../layouts/AvatarGroup";
import { useThemeStore } from "../../store/themeStore";

interface AssignedUser {
  _id: string;
  profileImageUrl?: string;
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
  onClick,
}) => {
  const { isDarkMode } = useThemeStore();

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
  const durationDays = moment(dueDate).diff(moment(createdAt), "days");

  // Generate avatar data for the assigned users:
  const avatarData = assignedTo.map((user) => ({
    image: user.profileImageUrl || undefined,
    initials: user.name
      ? user.name.split(" ").slice(0, 2).map((word) => word[0]).join("").toUpperCase()
      : "",
  }));

  return (
    <div
      className={`rounded-xl py-4 shadow-md border cursor-pointer ${
        isDarkMode
          ? "bg-gray-900 border-gray-700 shadow-gray-800/20"
          : "bg-white border-gray-200/50 shadow-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 px-4">
        <div
          className={`text-[9px] font-medium px-4 py-0.5 rounded ${
            isDarkMode
              ? getStatusTagColor()
                  .replace(/bg-(.*?)\s/, "bg-opacity-20 ")
                  .replace("border", "border-0") + " bg-gray-800"
              : getStatusTagColor()
          }`}
        >
          {status}
        </div>

        <div
          className={`text-[11px] font-medium px-4 py-0.5 rounded ${
            isDarkMode
              ? getPriorityTagColor()
                  .replace(/bg-(.*?)\s/, "bg-opacity-20 ")
                  .replace("border", "border-0") + " bg-gray-800"
              : getPriorityTagColor()
          }`}
        >
          {priority} Priority
        </div>
      </div>

      <div
        className={`px-4 border-l-[5px] 
          ${
            status === "inProgress"
              ? "border-cyan-500"
              : status === "completed"
              ? "border-indigo-500"
              : "border-violet-500"
          }`}
      >
        <p
          className={`text-sm font-medium mt-4 line-clamp-2 ${
            isDarkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs mt-1.5 line-clamp-2 leading-[18px] ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {description}
        </p>
        <p
          className={`text-[13px] font-medium mt-2 mb-2 leading-[18px] ${
            isDarkMode ? "text-gray-300/80" : "text-gray-700/80"
          }`}
        >
          Task Done{" "}
          <span
            className={`font-semibold ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {actualCompleted} / {totalTodos}
          </span>
        </p>
        <Progress progress={progress} status={status} isDarkMode={isDarkMode} />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between my-1">
          <div>
            <label
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Start Date
            </label>
            <p
              className={`text-[13px] font-medium ${
                isDarkMode ? "text-gray-200" : "text-gray-900"
              }`}
            >
              {moment(createdAt).format("Do MMM YYYY")}
            </p>
          </div>
        </div>
        <div>
          <label
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Due Date
          </label>
          <p
            className={`text-[13px] font-medium ${
              isDarkMode ? "text-gray-200" : "text-gray-900"
            }`}
          >
            {moment(dueDate).format("Do MMM YYYY")}
          </p>
        </div>
        <div className="mt-2">
          <label
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Duration
          </label>
          <p
            className={`text-[13px] font-medium ${
              isDarkMode ? "text-gray-200" : "text-gray-900"
            }`}
          >
            {durationDays} {durationDays === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 px-4">
        <AvatarGroup avatars={avatarData} isDarkMode={isDarkMode} />
        {attachmentCount > 0 && (
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
              isDarkMode ? "bg-blue-900/30" : "bg-blue-50"
            }`}
          >
            <LuPaperclip className={isDarkMode ? "text-blue-400" : "text-blue-900"} />
            <span
              className={`text-xs ${
                isDarkMode ? "text-gray-300" : "text-gray-900"
              }`}
            >
              {attachmentCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProgressProps {
  progress: number;
  status: string;
  isDarkMode: boolean;
}

const Progress: React.FC<ProgressProps> = ({ progress, status, isDarkMode }) => {
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
    <div
      className={`w-full rounded-full h-1.5 ${
        isDarkMode ? "bg-gray-700" : "bg-gray-200"
      }`}
    >
      <div
        className={`${getColor()} h-1.5 rounded-full transition-all duration-300`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

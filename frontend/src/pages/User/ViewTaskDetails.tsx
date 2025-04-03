import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import DashboardLayout from "../../layouts/DashboardLayout";
import moment from "moment";
import AvatarGroup from "../../layouts/AvatarGroup";
import { LuSquareArrowDownRight } from "react-icons/lu";
import UsersTaskSkeleton from "../../components/skeleton/UsersTaskSkeleton";
import { useThemeStore } from "../../store/themeStore";

interface TodoItem {
  text: string;
  completed: boolean;
}

interface User {
  _id: string;
  profileImageUrl: string;
  name?: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: "pending" | "inProgress" | "completed";
  dueDate?: string;
  assignedTo: User[];
  createdBy: User;
  attachments: string[];
  todoChecklist: TodoItem[];
  progress: number;
}

const ViewTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const { isDarkMode } = useThemeStore();

  const getStatusTagColor = (status: Task["status"]) => {
    switch (status) {
      case "inProgress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/10";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`);
      setTask(response.data.task);
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  const updateTodoCheckList = async (index: number) => {
    if (!task) return;

    const updatedTodos = task.todoChecklist.map((todo, i) =>
      i === index ? { ...todo, completed: !todo.completed } : todo
    );
    const completedCount = updatedTodos.filter(todo => todo.completed).length;
    let newStatus: Task["status"] = task.status;
    if (completedCount === updatedTodos.length) {
      newStatus = "completed";
    } else if (completedCount > 0) {
      newStatus = "inProgress";
    } else {
      newStatus = "pending";
    }

    const optimisticTask = { ...task, todoChecklist: updatedTodos, status: newStatus };
    setTask(optimisticTask);

    try {
      const response = await axiosInstance.put(`/tasks/${id}/todo`, {
        todoChecklist: updatedTodos,
      });

      setTask(response.data.task);
    } catch (error) {
      console.error("Error updating todo checklist:", error);
      await getTaskDetailsByID();
    }
  };

  const handleLinkClick = (link: string) => {
    window.open(link, "_blank");
  };

  useEffect(() => {
    if (id) {
      getTaskDetailsByID();
    }
  }, [id]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5">
        {task ? (
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-xl font-medium">{task.title}</h2>
                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                    task.status
                  )} px-2 py-0.5 rounded`}
                >
                  {task.status}
                </div>
              </div>

              <div className="mt-4">
                <InfoBox
                  label="Description"
                  value={task.description}
                  isDarkMode={isDarkMode}
                />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Priority"
                    value={task.priority}
                    isDarkMode={isDarkMode}
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Due Date"
                    value={task.dueDate ? moment(task.dueDate).format("Do MMM YYYY") : "N/A"}
                    isDarkMode={isDarkMode}
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">Assigned To</label>
                  <AvatarGroup
                    avatars={task.assignedTo.map((item) => ({
                      image: item.profileImageUrl,
                      initials: item.name ? item.name.split(" ").map((n) => n[0]).join("") : "NA",
                    }))}
                    maxVisible={5}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-slate-500">Todo Checklist</label>
                {task.todoChecklist.map((item, index) => (
                  <TodoCheckList
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item.completed}
                    onChange={() => updateTodoCheckList(index)}
                  />
                ))}
              </div>

              {task.attachments.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-500">Attachments</label>
                  {task.attachments.map((link, index) => (
                    <Attachment
                      key={`link_${index}`}
                      link={link}
                      index={index}
                      onClick={() => handleLinkClick(link)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <UsersTaskSkeleton />
        )}
      </div>
    </DashboardLayout>
  );
};

interface InfoBoxProps {
  label: string;
  value: string;
  isDarkMode: boolean;
}

const InfoBox = ({ label, value, isDarkMode }: InfoBoxProps) => (
  <div className="mb-4">
    <label className={`text-xs ${isDarkMode ? "text-gray-200" : "text-slate-500"} font-medium`}>
      {label}
    </label>
    <p className={`text-[13px] md:text-[13px] font-medium ${isDarkMode ? "text-white" : "text-gray-700"} mt-0.5`}>
      {value}
    </p>
  </div>
);

interface TodoCheckListProps {
  text: string;
  isChecked: boolean;
  onChange: () => void;
}
const TodoCheckList = ({ text, isChecked, onChange }: TodoCheckListProps) => (
  <div className="flex items-center gap-3 p-3">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      className="w-4 h-4 text-blue-600 bg-gray-100 rounded-sm outline-none"
    />
    <p className="text-[13px] text-gray-800">{text}</p>
  </div>
);

interface AttachmentProps {
  link: string;
  index: number;
  onClick: () => void;
}

const Attachment = ({ link, index, onClick }: AttachmentProps) => (
  <div
    className="flex justify-between bg-gray-50 border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer hover:bg-gray-100"
    onClick={onClick}
  >
    <div className="flex flex-1 items-center gap-3 truncate">
      <span className="text-xs text-gray-400 font-semibold mr-2">
        {index < 9 ? `0${index + 1}` : index + 1}
      </span>
      <p className="text-xs text-black truncate">{link}</p>
    </div>
    <LuSquareArrowDownRight className="text-gray-400 shrink-0" />
  </div>
);

export default ViewTaskDetails;

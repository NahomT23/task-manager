import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "../../layouts/DashboardLayout";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../api/axiosInstance";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";

import SelectDropDown from "../../components/SelectDropDown";
import SelectUsers from "../../components/SelectUsers";
import TodoListInput from "../../components/TodoListInput";
import AddAttachmentsInput from "../../components/AddAttachmentsInput";
import { taskFormSchema, TaskFormValues } from "../../formSchemas/taskFormSchema";
import { useThemeStore } from "../../store/themeStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  dueDate: new Date(),
  assignedTo: [],
  todoChecklist: [],
  attachments: [],
  progress: 0,
};

type TaskPayload = TaskFormValues & { id?: string };

const CreateTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { state } = useLocation();
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const isEditing = Boolean(taskId);
  const { isDarkMode } = useThemeStore();
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    register,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const currentTask = watch();

  // — Create / Update Mutation
  const createOrUpdateTask = useMutation<
    AxiosResponse<any>,
    Error,
    TaskPayload
  >({
    mutationFn: (payload) => {
      const { id, dueDate, ...rest } = payload;
      const isoDate = dueDate!.toISOString();
      if (id) {
        return axiosInstance.put(`/tasks/${id}`, { ...rest, dueDate: isoDate });
      } else {
        return axiosInstance.post("/tasks", { ...rest, dueDate: isoDate });
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        `Task ${variables.id ? "updated" : "created"} successfully`
      );
      if (!variables.id) {
        reset(defaultValues);
      }
      navigate("/admin/tasks");
    },
    onError: () => {
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} task`
      );
    },
  });

  // — Delete Mutation
  const deleteTaskMutation = useMutation<AxiosResponse<any>, Error, void>({
    mutationFn: () => axiosInstance.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
      navigate("/admin/tasks");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  // Prefill when editing
  useEffect(() => {
    if (!isEditing) {
      reset(defaultValues);
      return;
    }
    (async () => {
      try {
        const taskToEdit =
          state?.task ??
          (await axiosInstance.get(`/tasks/${taskId}`)).data.task;

        const fields: (keyof TaskFormValues)[] = [
          "title",
          "description",
          "priority",
          "status",
          "dueDate",
          "assignedTo",
          "attachments",
          "todoChecklist",
          "progress",
        ];
        fields.forEach((field) => {
          const value = (taskToEdit as any)[field];
          if (field === "dueDate") {
            setValue(field, new Date(value));
          } else if (field === "assignedTo") {
            setValue(field, (value as any[]).map((u) => u._id));
          } else {
            setValue(field, value);
          }
        });
      } catch {
        toast.error("Failed to load task data");
        navigate("/admin/tasks");
      }
    })();
  }, [isEditing, taskId, reset, setValue, state, navigate]);

  // Submit handler
  const onSubmit = (data: TaskFormValues) => {
    createOrUpdateTask.mutate({ ...data, id: taskId });
  };

  // Confirm delete handler
  const confirmDelete = () => deleteTaskMutation.mutate();

  return (
    <DashboardLayout activeMenu={isEditing ? "Update Task" : "Create Task"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">
                  {isEditing ? "Update Task" : "Create Task"}
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300"
                    onClick={() => setOpenDeleteAlert(true)}
                  >
                    <LuTrash2 className="text-base" /> Delete
                  </button>
                )}
              </div>

              {/* Title */}
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-600">
                  Task Title
                </label>
                <input
                  {...register("title")}
                  type="text"
                  placeholder="Task title..."
                  className="form-input"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Describe Task"
                  className="form-input h-32"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Priority / Due Date / Assign To */}
              <div className="grid grid-cols-12 gap-4 mt-2">
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-600">
                    Priority
                  </label>
                  <SelectDropDown
                    options={PRIORITY_DATA}
                    value={currentTask.priority as
                      | "low"
                      | "medium"
                      | "high"}
                    onChange={(v) =>
                      setValue("priority", v as "low" | "medium" | "high")
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-gray-400" : "text-slate-600"
                    }`}
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    {...register("dueDate", { valueAsDate: true })}
                    className={`form-input ${
                      isDarkMode ? "bg-gray-800/50 text-gray-200" : ""
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-medium text-slate-600">
                    Assign To
                  </label>
                  <SelectUsers
                    selectedUsers={currentTask.assignedTo}
                    setSelectedUsers={(users) =>
                      setValue("assignedTo", users)
                    }
                  />
                  {errors.assignedTo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.assignedTo.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Todo Checklist */}
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600">
                  Todo Checklist
                </label>
                <TodoListInput
                  control={control}
                  name="todoChecklist"
                  setValue={setValue}
                  register={register}
                  errors={errors.todoChecklist}
                />
              </div>

              {/* Attachments */}
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600">
                  Add Attachments
                </label>
                <AddAttachmentsInput
                  attachments={currentTask.attachments}
                  setAttachments={(atts) =>
                    setValue("attachments", atts)
                  }
                />
                {errors.attachments && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.attachments.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end mt-7 mb-5">
                <button
                  type="submit"
                  disabled={
                    isSubmitting || createOrUpdateTask.isPending
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ||
                  createOrUpdateTask.isPending
                    ? "Processing..."
                    : isEditing
                    ? "UPDATE TASK"
                    : "CREATE TASK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {openDeleteAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm z-50">
          <div
            className={`w-full max-w-sm p-6 rounded-xl shadow-2xl transform transition-transform ${
              isDarkMode
                ? "bg-gray-800 text-gray-200"
                : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold">Delete Task</h3>
              <button
                onClick={() => setOpenDeleteAlert(false)}
                className="text-2xl font-semibold focus:outline-none"
              >
                &times;
              </button>
            </div>
            <div className="mt-4">
              <p className="text-base">
                Are you sure you want to delete this task? This action cannot
                be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setOpenDeleteAlert(false)}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteTaskMutation.isPending}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteTaskMutation.isPending
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CreateTask;

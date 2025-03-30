import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "../../layouts/DashboardLayout";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../api/axiosInstance";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";
import SelectDropDown from "../../components/SelectDropDown";
import SelectUsers from "../../components/SelectUsers";
import TodoListInput from "../../components/TodoListInput";
import AddAttachmentsInput from "../../components/AddAttachmentsInput";
import { taskFormSchema, TaskFormValues } from "../../formSchemas/taskFormSchema";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImageUrl: string;
}

const CreateTask = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { state } = useLocation();
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const { 
    handleSubmit,
    control,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "low" as "low" | "medium" | "high",
      status: "pending",
      assignedTo: [],
      todoChecklist: [],
      attachments: []
    }
  });

  const currentTask = watch();

  useEffect(() => {
    console.log("Form Errors:", errors); // Log form errors
  }, [errors]);

  useEffect(() => {
    if (taskId && !state?.task) {
      getTaskDetailsById(taskId);
    } else if (state?.task) {
      setTaskFormValues(state.task);
    }
  }, [taskId, state]);


    const setTaskFormValues = (task: any) => {
    Object.entries(task).forEach(([key, value]) => {
      if (key === "dueDate" && value) {
        // Convert dueDate to a valid Date if necessary.
        if (value instanceof Date) {
          setValue(key, value);
        } else if (typeof value === "string" || typeof value === "number") {
          setValue(key, new Date(value));
        } else {
          // Fallback: if value is an object, set it as undefined or handle accordingly.
          setValue(key, undefined);
        }
      } else {
        // Cast value as any to satisfy TaskFormValues
        setValue(key as keyof TaskFormValues, value as any);
      }
    });
  };

  const getTaskDetailsById = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`);
      setTaskFormValues(response.data.task);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch task details");
      navigate("/tasks");
    }
  };

  const handleFormSubmit = async (data: TaskFormValues) => {
    const payload = {
      ...data,
      dueDate: data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate,
    };

    try {
      const apiCall = taskId 
        ? axiosInstance.put(`/tasks/${taskId}`, payload)
        : axiosInstance.post("/tasks/", payload);
  
      const response = await apiCall;
      toast.success(`Task ${taskId ? "updated" : "created"} successfully`);
      navigate(`/admin/dashboard`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  const deleteTask = async () => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      toast.success("Task deleted successfully");
      navigate("/tasks");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setOpenDeleteAlert(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Create Task">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-xl font-medium">
                  {taskId ? "Update Task" : "Create Task"}
                </h2>
                {taskId && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300"
                    onClick={() => setOpenDeleteAlert(true)}
                  >
                    <LuTrash2 className="text-base" /> Delete
                  </button>
                )}
              </div>

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
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

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
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-12 gap-4 mt-2">
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-600">
                    Priority
                  </label>
                  <SelectDropDown
                    options={PRIORITY_DATA}
                    value={currentTask.priority as "low" | "medium" | "high"}
                    onChange={(value) =>
                      setValue("priority", value as "low" | "medium" | "high")
                    }
                  />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-600">
                    Due Date
                  </label>
                  <input
                    type="date"
                    {...register("dueDate", { valueAsDate: true })}
                    className="form-input"
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
                  )}
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-medium text-slate-600">
                    Assign To
                  </label>
                  <SelectUsers
                    selectedUsers={currentTask.assignedTo}
                    setSelectedUsers={(users) => setValue("assignedTo", users)}
                  />
                  {errors.assignedTo && (
                    <p className="text-red-500 text-xs mt-1">{errors.assignedTo.message}</p>
                  )}
                </div>
              </div>

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

              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600">
                  Add Attachments
                </label>
                <AddAttachmentsInput
                  attachments={currentTask.attachments}
                  setAttachments={(attachments) => setValue("attachments", attachments)}
                />
                {errors.attachments && (
                  <p className="text-red-500 text-xs mt-1">{errors.attachments.message}</p>
                )}
              </div>

              <div className="flex justify-end mt-7">
                <button
                  type="submit"
                  className="add-btn cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : taskId ? "UPDATE TASK" : "CREATE TASK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {openDeleteAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium">Confirm Delete</h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setOpenDeleteAlert(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={deleteTask}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CreateTask;
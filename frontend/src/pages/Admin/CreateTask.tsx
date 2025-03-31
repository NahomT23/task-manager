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
import moment from "moment";

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
  const isEditing = !!taskId;

  const { 
    handleSubmit,
    control,
    register,
    setValue,
    reset, // Add reset here
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: new Date(),
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
      progress: 0
    }
  });
  

  const currentTask = watch();

  useEffect(() => {
    const initializeForm = async () => {
      if (isEditing && !taskId) {
        toast.error("Missing task ID");
        navigate("/admin/tasks");
        return;
      }
      if (isEditing) {
        try {
          const taskToEdit = state?.task 
            ? state.task 
            : await fetchTaskDetails(taskId!);
            
          if (taskToEdit) {
            const dueDate = new Date(taskToEdit.dueDate);
            const formattedDueDate = dueDate.toISOString().split('T')[0];
            setTaskFormValues(taskToEdit);
          }
        } catch (error) {
          toast.error("Failed to load task data");
          navigate("/tasks");
        }
      }
    };

    initializeForm();
  }, [taskId, state, isEditing]);



 
  const fetchTaskDetails = async (id: string) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data.task;
  };


  const setTaskFormValues = (task: any) => {
    const fields: (keyof TaskFormValues)[] = [
      'title', 'description', 'priority', 'status', 'dueDate', 
      'assignedTo', 'attachments', 'todoChecklist', 'progress'
    ];
  
    fields.forEach((field) => {
      const value = task[field];
      if (field === 'dueDate') {
        // Format the date using moment to "YYYY-MM-DD"
        // setValue(field, moment(new Date(value)).format("YYYY-MM-DD"));
        // setValue("dueDate", new Date(formattedDate));

        const formattedDate = new Date(value).toISOString().split('T')[0];
        setValue(field, new Date(formattedDate)); // Now setValue gets a Date

      } else if (field === 'assignedTo') {
        setValue(field, value.map((u: any) => u._id));
      } else {
        setValue(field, value);
      }
    });
  };
  


const handleFormSubmit = async (data: TaskFormValues) => {
  try {
    if (isEditing && !taskId) {
      toast.error("Invalid task ID for update");
      return;
    }

    const payload = {
      ...data,
      dueDate: data.dueDate?.toISOString(),
    };

    const url = isEditing ? `/tasks/${taskId}` : "/tasks/";
    const method = isEditing ? "put" : "post";

    await axiosInstance[method](url, payload);
    toast.success(`Task ${isEditing ? "updated" : "created"} successfully`);

    // Clear the form after submission
    reset();

    navigate("/admin/tasks");
  } catch (error) {
    console.log("error during form submission inside createTask: ", error);
  }
};


const deleteTask = async () => {
  try {
    if (!taskId) {
      toast.error("No task ID provided for deletion");
      return;
    }
    
    await axiosInstance.delete(`/tasks/${taskId}`);
    toast.success("Task deleted successfully");
    navigate("/admin/tasks");
  } catch (error) {
    console.log("error while deleting: ",  error)
  }
};
  return (
    <DashboardLayout activeMenu={isEditing ? "Update Task" : "Create Task"}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-xl font-medium">
                  {isEditing ? "Update Task" : "Create Task"}
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300"
                    onClick={() => setOpenDeleteAlert(true)}
                  >
                    <LuTrash2 className="text-base" /> Delete
                  </button>
                )}
              </div>


                            {/* Rest of your form fields remain the same */}
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
                   value={ currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split("T")[0] : ""}
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
                  {isSubmitting ? "Processing..." : isEditing ? "UPDATE TASK" : "CREATE TASK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Delete confirmation modal */}
      {openDeleteAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-medium">Delete Task</h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpenDeleteAlert(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteTask}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
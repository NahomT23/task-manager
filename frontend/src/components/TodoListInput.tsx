import { useEffect } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";

interface TodoListInputProps {
  control: any;
  name: string;
  setValue: any;
  register: any;
  errors: any;
}

const TodoListInput = ({ control, name, setValue, register, errors }: TodoListInputProps) => {


  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const todoItems = useWatch({
    control,
    name: name,
    defaultValue: []
  });

  useEffect(() => {
    const completedCount = todoItems.filter((item: any) => item.completed).length;
    const totalItems = todoItems.length;
    const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    setValue("progress", progress);
  }, [todoItems, setValue]);


  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register(`${name}.${index}.completed`)}
            className="h-4 w-4"
          />
          <div className="flex-1">
            <input
              {...register(`${name}.${index}.text`, { required: "Checklist item is required" })}
              className="w-full p-1 border-b"
              placeholder="Checklist item"
            />
            {errors?.[index]?.text && (
              <p className="text-red-500 text-xs mt-1">
                {errors[index].text.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-600"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      ))}
<button
  type="button"
  onClick={() => append({ text: "", completed: false })}
  className={`flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 text-sm transition-colors duration-200`}
>
  <HiMiniPlus className="w-4 h-4" /> Add Todo
</button>

    </div>
  );
};

export default TodoListInput;
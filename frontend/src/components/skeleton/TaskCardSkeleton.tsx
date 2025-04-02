
const TaskCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 animate-pulse">
      <div className="flex items-end gap-3 px-4">
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>

      <div className="px-4 border-l-[5px] border-gray-200">
        <div className="w-36 h-5 bg-gray-200 rounded mt-4"></div>
        <div className="w-full h-3 bg-gray-200 rounded mt-2"></div>
        <div className="w-full h-3 bg-gray-200 rounded mt-2"></div>
        <div className="w-32 h-2 bg-gray-200 rounded mt-2"></div>
      </div>

      <div className="px-4 mt-3 flex justify-between items-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default TaskCardSkeleton;

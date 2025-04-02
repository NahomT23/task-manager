
const UsersTaskSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      <div className="form-card col-span-3 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 w-1/3 rounded"></div>
          <div className="h-4 bg-gray-300 w-24 rounded"></div>
        </div>

        <div className="h-6 bg-gray-300 rounded mb-4"></div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-6 md:col-span-4">
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
          <div className="col-span-6 md:col-span-4">
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
          <div className="col-span-6 md:col-span-4">
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTaskSkeleton;

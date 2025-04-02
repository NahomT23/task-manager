

import DashboardLayout from "../../layouts/DashboardLayout";

const UserDetailsSkeleton = () => (
  <DashboardLayout activeMenu="User Details">
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6 flex items-center text-gray-600 hover:text-gray-800 text-sm">
        <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 animate-pulse" />
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center space-y-2 animate-pulse">
            <div className="h-8 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Assigned Tasks */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default UserDetailsSkeleton;


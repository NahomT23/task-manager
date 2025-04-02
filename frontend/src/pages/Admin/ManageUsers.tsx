import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import axiosInstance from "../../api/axiosInstance";
import { LuFileSpreadsheet } from "react-icons/lu";
import { UserCard } from "../../components/Cards/UserCard";
import { toast } from "react-toastify";
import UserCardSkeleton from "../../components/skeleton/UserCardSkeleton";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImageUrl: string;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // Add a loading state

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.log("error fetching users: ", error);
    } finally {
      setLoading(false); // Stop loading when data is fetched
    }
  };

  // Filter users based on search query
  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadReport = async (format: "excel" | "pdf") => {
    try {
      const response = await axiosInstance.get(`/reports/export/users?type=${format}`, {
        responseType: "blob",
      });

      // Get proper extension
      const extension = format === "excel" ? "xlsx" : "pdf"; // Fix here

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `user_report.${extension}`); // Use correct extension
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="w-full">
            <h2 className="text-xl md:text-2xl font-medium mb-4">Team Members</h2>
            <div className="max-w-96 mb-4">
              <input
                type="text"
                placeholder=" Search by name or email..."
                className="w-full py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => handleDownloadReport("excel")} className="flex download-btn">
              <LuFileSpreadsheet className="text-lg" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleDownloadReport("pdf")}
              className="flex download-btn bg-red-600 hover:bg-red-700"
            >
              <LuFileSpreadsheet className="text-lg" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


  {loading ? (
    <UserCardSkeleton count={Math.max(9, allUsers?.length || 0)} />
  ) : (
    filteredUsers.map((user) => (
      <UserCard key={user._id} userInfo={user} />
    ))
  )}
</div>


        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">No users found</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;

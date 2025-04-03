import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import axiosInstance from "../../api/axiosInstance";
import { LuFileSpreadsheet } from "react-icons/lu";
import { FiCopy } from "react-icons/fi";
import { UserCard } from "../../components/Cards/UserCard";
import { toast } from "react-toastify";
import UserCardSkeleton from "../../components/skeleton/UserCardSkeleton";
import { useThemeStore } from "../../store/themeStore";

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
  const [loading, setLoading] = useState(true);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
  const { isDarkMode } = useThemeStore();

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.log("error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvitationCode = async () => {
    try {
      const response = await axiosInstance.post("/org/generate-invitation");
      setInvitationToken(response.data.invitationToken);
      toast.success("Invitation code generated successfully!");
    } catch (error) {
      toast.error("Failed to generate invitation code");
      console.error("Error generating invitation code:", error);
    }
  };

  const handleDownloadReport = async (format: "excel" | "pdf") => {
    setIsDownloadPopupOpen(false);
    
    try {
      const response = await axiosInstance.get(`/reports/export/users?type=${format}`, {
        responseType: "blob",
      });

      const extension = format === "excel" ? "xlsx" : "pdf";
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `user_report.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report");
    }
  };

  const copyToClipboard = () => {
    if (invitationToken) {
      navigator.clipboard.writeText(invitationToken);
      toast.success("Copied to clipboard!");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="w-full">
            <h2 className="text-xl md:text-2xl font-medium mb-4">Team Members</h2>
            <div className="max-w-96 mb-4">
              <input
                type="text"
                placeholder=" Search by name or email..."
                className="w-full py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons Container */}
          <div className="flex gap-2 flex-wrap lg:flex-nowrap justify-end mb-4 lg:mb-0">
            {/* Invitation Button */}
            <button
              onClick={generateInvitationCode}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap"
            >
              Generate Invitation Code
            </button>

            {/* Download Report Section */}
            <div className="relative">
              <button
                onClick={() => setIsDownloadPopupOpen(!isDownloadPopupOpen)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap"
              >
                <LuFileSpreadsheet className="text-base" />
                Download Report
              </button>

              {isDownloadPopupOpen && (
                <div 
                  className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-20 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleDownloadReport("excel")}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                      isDarkMode 
                        ? 'text-white hover:bg-gray-700' 
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <LuFileSpreadsheet className="text-base" /> Excel
                  </button>
                  <button
                    onClick={() => handleDownloadReport("pdf")}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                      isDarkMode 
                        ? 'text-white hover:bg-gray-700' 
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <LuFileSpreadsheet className="text-base" /> PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Invitation Token Display */}
          {invitationToken && (
            <div 
              className={`flex items-center gap-2 p-3 rounded-lg w-full lg:w-auto ${
                isDarkMode 
                  ? 'bg-blue-900/20 border border-blue-800' 
                  : 'bg-blue-100 border border-blue-200'
              }`}
            >
              <span className={`font-mono text-sm break-all ${
                isDarkMode ? 'text-blue-200' : 'text-blue-800'
              }`}>
                {invitationToken}
              </span>
              <FiCopy
                className={`cursor-pointer text-lg ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                } hover:opacity-80 transition-opacity`}
                onClick={copyToClipboard}
              />
            </div>
          )}

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
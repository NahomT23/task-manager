import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import axiosInstance from "../../api/axiosInstance";
import { LuFileSpreadsheet } from "react-icons/lu";
import { FiCopy, FiCheck } from "react-icons/fi";
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
  joinedAt: string;
  assignedTasks: number;
  priority?: string;
}

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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

      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report");
    }
  };

  const copyToClipboard = () => {
    if (invitationToken) {
      navigator.clipboard.writeText(invitationToken);
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
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
      <div className="my-5">
        <div className="flex flex-col gap-4">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-xl font-medium">Team Members</h2>
            <div className="relative">
              <button
                onClick={() => setIsDownloadPopupOpen((prev) => !prev)}
                className={`px-2 py-1 text-xs border rounded-md ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                Download Report
              </button>
              {isDownloadPopupOpen && (
                <div
                  className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-10 ${
                    isDarkMode
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="p-3">
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => handleDownloadReport("excel")}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <LuFileSpreadsheet className="text-lg" />
                          Excel
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleDownloadReport("pdf")}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <LuFileSpreadsheet className="text-lg" />
                          PDF
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
  
          {/* Search and Invitation Code Generator Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between items-start">
            <input
              type="text"
              placeholder=" Search.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-1 border rounded-md max-w-xs"
            />
            <button
              onClick={generateInvitationCode}
              className="px-4 py-2 border rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs whitespace-nowrap"
            >
              Generate Invitation Code
            </button>
          </div>
  
          {invitationToken && (
            <div
              className={`flex items-center gap-2 p-2 rounded-md w-fit ${
                isDarkMode
                  ? "bg-blue-900/20 border border-blue-800"
                  : "bg-blue-100 border border-blue-200"
              }`}
            >
              <span className="font-mono text-xs break-all">
                {invitationToken}
              </span>
              {isCopied ? (
                <FiCheck
                  className={`cursor-pointer ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                  onClick={copyToClipboard}
                />
              ) : (
                <FiCopy
                  className={`cursor-pointer ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                  onClick={copyToClipboard}
                />
              )}
            </div>
          )}
  
          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <UserCardSkeleton count={9} />
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard key={user._id} userInfo={user} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
  
};

export default ManageUsers;

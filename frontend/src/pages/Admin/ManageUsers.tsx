import { useEffect, useState } from "react"
import DashboardLayout from "../../layouts/DashboardLayout"
import axiosInstance from "../../api/axiosInstance"
import { LuFileSpreadsheet } from "react-icons/lu"
import { UserCard } from "../../components/Cards/UserCard"

interface User {
  _id: string
  name: string
  email: string
  profileImageUrl: string
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
}

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/users')
      if (response.data?.length > 0) {
        setAllUsers(response.data)
      }
    } catch (error) {
      console.log("error fetching users: ", error)
    }
  }

  // Filter users based on search query
  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownloadReport = async () => {
    // Download report logic
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="w-full">
            <h2 className="text-xl md:text-2xl font-medium mb-4">
              Team Members
            </h2>
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

          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 h-fit"
          >
            <LuFileSpreadsheet className="text-lg" />
            <span className="hidden lg:inline">Download Report</span>
            <span className="lg:hidden">Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user._id}
              userInfo={user}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found 
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers
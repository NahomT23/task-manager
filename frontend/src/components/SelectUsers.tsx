import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { LuUsers } from "react-icons/lu";
import Modal from "../layouts/Modal";
import AvatarGroup, { getInitialsColor } from "../layouts/AvatarGroup";
import { useThemeStore } from "../store/themeStore";
import { User } from "../types";



interface SelectUsersProps {
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
}

const SelectUsers = ({ selectedUsers, setSelectedUsers }: SelectUsersProps) => {
  const { isDarkMode } = useThemeStore();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState<string[]>([]);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get<User[]>('/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setTempSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsModalOpen(false);
  };

  const selectedUserAvatars = allUsers
    .filter(user => selectedUsers.includes(user._id))
    .map(user => ({
      image: user.profileImageUrl || undefined,
      initials: user.name?.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase() || ''
    }));

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setTempSelectedUsers([]);
    }
  }, [selectedUsers]);

  return (
    <div className="space-y-4 mt-2">
      {selectedUserAvatars.length === 0 ? (
        <button
          type="button"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${
            isDarkMode 
              ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
          }`}
          onClick={() => setIsModalOpen(true)}
        >
          <LuUsers className="text-sm" /> Add Members
        </button>
      ) : (
        <div onClick={() => setIsModalOpen(true)}>
          <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Users"
      >
        <div className={`space-y-4 h-[60vh] overflow-auto ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {allUsers.map(user => {
            const initials = user.name?.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase() || '';
            
            return (
              <div
                key={user._id}
                className={`flex items-center gap-4 p-3 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full" 
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium ${
                    getInitialsColor(initials)
                  }`}>
                    <span>{initials}</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {user.name}
                  </p>
                  <p className={`text-[13px] ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user.email}
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={tempSelectedUsers.includes(user._id)}
                  onChange={() => toggleUserSelection(user._id)} 
                  className={`w-4 h-4 text-blue-600 rounded-sm outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-gray-100 border-gray-300'
                  }`}
                />
              </div>
            )}
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${
              isDarkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
            onClick={() => setIsModalOpen(false)}
          >
            CANCEL
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={handleAssign}
          >
            DONE
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SelectUsers;
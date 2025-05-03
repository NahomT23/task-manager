import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from "react-hot-toast";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';



const Setup: React.FC = () => {
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const { isDarkMode } = useThemeStore();
      
  



  const handleCreateOrganization = async () => {
    if (organizationName.trim() === '') {
      toast.error('Organization name is required');
      return;
    }
    try {
      const response = await axiosInstance.post('/org/create', { name: organizationName });
      if (response.status === 201) {

        setAuth(response.data.token, response.data.user);
        toast.success(`${organizationName} created successfully`);
        navigate('/admin/dashboard');
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating organization');
    }
  };
  const handleJoinOrganization = async () => {
    if (invitationCode.trim() === '') {
      toast.error('Invitation code is required');
      return;
    }
    try {
      const response = await axiosInstance.post('/org/join', { invitationToken: invitationCode });
      if (response.status === 200) {
        setAuth(response.data.token, response.data.user);
        const orgName = response.data.organization.name;
        toast.success(`Joined ${orgName} successfully`);
        navigate('/signin');
      } else {
        toast.error('Failed to join organization');
      }
    } catch (error) {
      toast.error('Invalid invitation code');
      console.error(error);
    }
  };
  

    const cardVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      hover: { scale: 1.02 },
      tap: { scale: 0.98 }
    };
  
    const modalVariants = {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <motion.div 
          className="flex flex-col md:flex-row gap-8 md:gap-12"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Create Organization Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white backdrop-blur-lg rounded-2xl p-8 w-full md:w-80 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Organization
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Launch your own organization and start collaborating with your team in a dedicated workspace.
              </p>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                Create
              </motion.button>
            </div>
          </motion.div>
  
          {/* Join Organization Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white backdrop-blur-lg rounded-2xl p-8 w-full md:w-80 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Join Organization
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Already have an invitation? Join your team's organization using a provided access code.
              </p>
              <motion.button
                onClick={() => setShowJoinModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                Join
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
  
        <AnimatePresence>
          {/* Create Organization Modal */}
          {showCreateModal && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              transition={{ type: "spring", bounce: 0.25 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-4"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-xs md:max-w-sm shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Organization</h2>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className={`w-full border border-gray-200 p-3 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isDarkMode ? 'text-black' : ''}`}
                  placeholder="Organization Name"
                />
                <div className="flex justify-end gap-3">
                  <motion.button
                    onClick={() => setShowCreateModal(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleCreateOrganization}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
  
          {/* Join Organization Modal */}
          {showJoinModal && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              transition={{ type: "spring", bounce: 0.25 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-4"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-xs md:max-w-sm shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Join Organization</h2>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className={`w-full border border-gray-200 p-3 rounded-lg mb-6 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${isDarkMode ? 'text-black' : ''}`}
                  placeholder="Invitation Code"
                />
                <div className="flex justify-end gap-3">
                  <motion.button
                    onClick={() => setShowJoinModal(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleJoinOrganization}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Join
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
;

export default Setup;

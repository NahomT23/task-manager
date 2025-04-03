
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const Setup: React.FC = () => {
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  const handleCreateOrganization = async () => {
    if (organizationName.trim() === '') {
      alert('Organization name is required');
      return;
    }
    try {
      const response = await axiosInstance.post('/org/create', { name: organizationName });
      if (response.status === 201) {
        navigate('/admin/dashboard');
        toast.success(`${organizationName} created successfully`)
      } else {
        toast.error('Failed to create organization');
      }
    } catch (error: any) {
      console.error(error);
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
        const orgName = response.data.organization.name;
        toast.success(`Joined ${orgName} successfully`);
        navigate('/user/dashboard');
      }
    } catch (error) {
      toast.error('Failed to join organization');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex space-x-8">
        {/* Create Organization Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-64 text-center">
          <h2 className="text-xl font-bold mb-4">Create Organization</h2>
          <p className="mb-6">Start your own organization.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>

        {/* Join Organization Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-64 text-center">
          <h2 className="text-xl font-bold mb-4">Join Organization</h2>
          <p className="mb-6">Join an existing organization with an invitation code.</p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Join
          </button>
        </div>
      </div>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Enter Organization Name</h2>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded mb-4"
              placeholder="Organization Name"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrganization}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Organization Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Enter Invitation Code</h2>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded mb-4"
              placeholder="Invitation Code"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinOrganization}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setup;

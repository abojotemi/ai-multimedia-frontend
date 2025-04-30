import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { userService } from '../api/apiService';
import ConfirmationModal from './ConfirmationModal';

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const { updateProfile } = useUserStore();
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Status states
  const [profileStatus, setProfileStatus] = useState({ loading: false, success: false, error: null });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: false, error: null });
  
  // Modal states
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);
  
  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset status when form changes
    setProfileStatus({ loading: false, success: false, error: null });
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset status when form changes
    setPasswordStatus({ loading: false, success: false, error: null });
  };
  
  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // If username has changed, show confirmation modal
    if (profileForm.username !== user.username) {
      setShowUsernameModal(true);
    } else {
      // No changes to confirm, just save
      await updateProfileData();
    }
  };
  
  // Process profile update after confirmation
  const updateProfileData = async () => {
    setProfileStatus({ loading: true, success: false, error: null });
    
    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        setProfileStatus({ loading: false, success: true, error: null });
        
        // Update user in auth store to reflect changes in UI
        if (user) {
          setUser({
            ...user,
            username: profileForm.username
          });
        }
      } else {
        setProfileStatus({ loading: false, success: false, error: result.error });
      }
    } catch (error) {
      setProfileStatus({ 
        loading: false, 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile'
      });
    }
  };
  
  // Submit password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ 
        loading: false, 
        success: false, 
        error: 'New passwords do not match'
      });
      return;
    }
    
    // Show confirmation modal
    setShowPasswordModal(true);
  };
  
  // Process password update after confirmation
  const updatePasswordData = async () => {
    setPasswordStatus({ loading: true, success: false, error: null });
    
    try {
      const result = await userService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordStatus({ loading: false, success: true, error: null });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordStatus({ 
        loading: false, 
        success: false, 
        error: error.response?.data?.message || 'Failed to update password'
      });
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={profileForm.username}
                onChange={handleProfileChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jasper focus:border-jasper block w-full p-2.5"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jasper focus:border-jasper block w-full p-2.5"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
          
          {profileStatus.success && (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
              Profile updated successfully!
            </div>
          )}
          
          {profileStatus.error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {profileStatus.error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={profileStatus.loading}
            className="text-white bg-jasper hover:bg-jasper/90 focus:ring-4 focus:outline-none focus:ring-jasper/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {profileStatus.loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
      
      {/* Password Change Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jasper focus:border-jasper block w-full p-2.5"
              required
            />
          </div>
          
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jasper focus:border-jasper block w-full p-2.5"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jasper focus:border-jasper block w-full p-2.5"
                required
              />
            </div>
          </div>
          
          {passwordStatus.success && (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
              Password updated successfully!
            </div>
          )}
          
          {passwordStatus.error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {passwordStatus.error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={passwordStatus.loading}
            className="text-white bg-jasper hover:bg-jasper/90 focus:ring-4 focus:outline-none focus:ring-jasper/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {passwordStatus.loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
      
      {/* Username Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onConfirm={() => {
          updateProfileData();
          setShowUsernameModal(false);
        }}
        title="Change Username"
        message={`Are you sure you want to change your username from "${user?.username}" to "${profileForm.username}"? This will affect how others see you across the platform.`}
        confirmButtonText="Yes, Change Username"
      />
      
      {/* Password Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={() => {
          updatePasswordData();
          setShowPasswordModal(false);
        }}
        title="Change Password"
        message="Are you sure you want to change your password? You'll need to use the new password the next time you log in."
        confirmButtonText="Yes, Change Password"
      />
    </div>
  );
};

export default Settings;
import { create } from 'zustand'
import { userService } from '../api/apiService'

const useUserStore = create((set, get) => ({
  // User profile state
  profile: {
    id: '',
    username: '',
    email: '',
    createdAt: ''
  },
  
  // User settings state
  settings: {
    notifications: {
      email: true,
      push: true
    },
    privacy: {
      shareData: false
    },
    display: {
      defaultView: 'grid',
      itemsPerPage: 20
    },
    ai: {
      autoTagging: true,
      autoTranscription: false,
      autoOcr: false
    }
  },
  
  isLoading: false,
  isUpdating: false,
  error: null,
  
  // Fetch user profile
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await userService.getCurrentUser();
      console.log(`User profile: ${data}`)
      set({ profile: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch user profile',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to fetch user profile' };
    }
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    set({ isUpdating: true, error: null });
    
    try {
      const data = await userService.updateProfile(profileData);
      set({ profile: data, isUpdating: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user profile:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update user profile',
        isUpdating: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to update user profile' };
    }
  },
  
  // Update user password
  updatePassword: async (passwordData) => {
    set({ isUpdating: true, error: null });
    
    try {
      await userService.updatePassword(passwordData);
      set({ isUpdating: false });
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update password',
        isUpdating: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to update password' };
    }
  },
  
  // Fetch user settings
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await userService.getSettings();
      set({ settings: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch user settings',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to fetch user settings' };
    }
  },
  
  // Update user settings
  updateSettings: async (settingsData) => {
    set({ isUpdating: true, error: null });
    
    try {
      const data = await userService.updateSettings(settingsData);
      set({ settings: data, isUpdating: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user settings:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update user settings',
        isUpdating: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to update user settings' };
    }
  },
  
  // Update specific setting
  updateSetting: async (section, key, value) => {
    set(state => ({
      settings: {
        ...state.settings,
        [section]: {
          ...state.settings[section],
          [key]: value
        }
      }
    }));
    
    // Save to backend
    const settings = get().settings;
    return get().updateSettings(settings);
  },
  
  // Clear error
  clearError: () => set({ error: null })
}));

export default useUserStore;
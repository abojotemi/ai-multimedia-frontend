// Export all stores from a single file for easier imports
import useAuthStore from './authStore';
import useDashboardStore from './dashboardStore';
import useUploadStore from './uploadStore';
import useCollectionStore from './collectionStore';
import useAiStore from './aiStore';
import useSearchStore from './searchStore';
import useUserStore from './userStore';

// Export all stores
export {
  useAuthStore,
  useDashboardStore,
  useUploadStore,
  useCollectionStore,
  useAiStore,
  useSearchStore,
  useUserStore
};

// Create a hook to access all stores at once if needed
export const useStore = () => ({
  auth: useAuthStore(),
  dashboard: useDashboardStore(),
  upload: useUploadStore(),
  collection: useCollectionStore(),
  ai: useAiStore(),
  search: useSearchStore(),
  user: useUserStore()
});

// Export default store for backward compatibility
export default useAuthStore;
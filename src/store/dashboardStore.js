import { create } from 'zustand'
import { dashboardService, mediaService } from '../api/apiService'

const dashboardStore = create((set, get) => ({
  // Media items state
  mediaItems: [],
  filteredMediaItems: [],
  isLoadingMedia: false,

  // Recent activities state
  recentActivities: [],
  isLoadingActivities: false,

  // Dashboard stats state
  stats: {
    totalAssets: 0,
    processing: 0,
    storageUsed: {
      percentage: 0,
      used: 0,
      total: 0
    },
    aiInsights: 0
  },
  isLoadingStats: false,

  // Content analytics state
  analytics: {
    mediaTypeDistribution: {
      images: 0,
      videos: 0,
      audio: 0
    },
    popularTags: [],
    aiProcessingSavings: {
      efficiency: 0,
      timeSaved: 0
    }
  },
  isLoadingAnalytics: false,

  // Search and filter state
  searchQuery: '',
  selectedTags: [],
  viewMode: 'grid',

  // Error state
  error: null,

  // Actions

  // Set view mode (grid or list)
  setViewMode: (mode) => set({ viewMode: mode }),

  // Search and filter actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterMediaItems();
  },

  toggleTag: (tag) => {
    set(state => {
      const selectedTags = state.selectedTags.includes(tag)
        ? state.selectedTags.filter(t => t !== tag)
        : [...state.selectedTags, tag];

      return { selectedTags };
    });
    get().filterMediaItems();
  },

  filterMediaItems: () => {
    const { mediaItems, searchQuery, selectedTags } = get();

    let filtered = mediaItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        selectedTags.every(tag => item.tags.includes(tag))
      );
    }

    set({ filteredMediaItems: filtered });
  },

  // Fetch media items from API
  fetchMediaItems: async () => {
    set({ isLoadingMedia: true, error: null });
    try {
      // Fetch the 10 most recent media items
      const params = { limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };
      console.log('Fetching latest 10 media items with params:', params); // Log params

      // Log authentication status before making the request
      console.log('Auth token exists:', !!localStorage.getItem('accessToken'));

      const data = await mediaService.getAllMedia(params);

      // Handle potential object response (like in AIProcessing.jsx)
      const mediaData = Array.isArray(data) ? data : (data && data.data && Array.isArray(data.data) ? data.data : []);
      console.log('Received media data:', mediaData); // Log received data

      set({
        mediaItems: mediaData,
        filteredMediaItems: mediaData, // Initialize filtered items as well
        isLoadingMedia: false
      });

      // Filters might not be applicable anymore if we only fetch 10 items,
      // but let's leave this for now. Consider if filtering should happen
      // client-side on these 10 items or trigger a new backend request.
      get().filterMediaItems();

      return mediaData;
    } catch (error) {
      console.error('Error fetching media items:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        console.error('Response error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      set({
        error: error.response?.data?.message || error.response?.data?.detail || 'Failed to load media items',
        isLoadingMedia: false
      });
      return [];
    }
  },

  // Fetch recent activities from API
  fetchRecentActivities: async () => {
    set({ isLoadingActivities: true, error: null });
    try {
      const data = await dashboardService.getActivities();

      set({
        recentActivities: data,
        isLoadingActivities: false
      });
      return data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      set({
        error: error.response?.data?.message || 'Failed to load recent activities',
        isLoadingActivities: false
      });
      return [];
    }
  },

  // Fetch dashboard stats from API
  fetchDashboardStats: async () => {
    set({ isLoadingStats: true, error: null });
    try {
      const data = await dashboardService.getStats();

      set({
        stats: data,
        isLoadingStats: false
      });
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      set({
        error: error.response?.data?.message || 'Failed to load dashboard stats',
        isLoadingStats: false
      });
      return get().stats;
    }
  },

  // Fetch content analytics from API
  fetchContentAnalytics: async () => {
    set({ isLoadingAnalytics: true, error: null });
    try {
      const data = await dashboardService.getAnalytics();

      set({
        analytics: data,
        isLoadingAnalytics: false
      });
      return data;
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      set({
        error: error.response?.data?.message || 'Failed to load content analytics',
        isLoadingAnalytics: false
      });
      return get().analytics;
    }
  },

  // Fetch all dashboard data at once
  fetchAllDashboardData: async () => {
    set({ error: null });

    try {
      // Fetch all data in parallel using get() to access the functions
      await Promise.all([
        get().fetchMediaItems(),
        get().fetchRecentActivities(),
        get().fetchDashboardStats(),
        get().fetchContentAnalytics()
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      set({ error: error.response?.data?.message || 'Failed to load dashboard data' });
      return { success: false, error: error.message };
    }
  },

  // Media item actions
  deleteMediaItem: async (itemId) => {
    try {
      await mediaService.deleteMedia(itemId);

      set(state => ({
        mediaItems: state.mediaItems.filter(item => {
          // Check both id and _id properties
          const id = item.id || item._id;
          return id !== itemId;
        }),
        filteredMediaItems: state.filteredMediaItems.filter(item => {
          // Check both id and _id properties
          const id = item.id || item._id;
          return id !== itemId;
        })
      }));

      // Refresh stats after deletion
      get().fetchDashboardStats();

      return { success: true };
    } catch (error) {
      console.error('Error deleting media item:', error);
      set({ error: error.response?.data?.message || 'Failed to delete media item' });
      return { success: false, error: error.message };
    }
  },

  // Update media metadata
  updateMediaMetadata: async (itemId, metadata) => {
    try {
      const updatedMedia = await mediaService.updateMediaMetadata(itemId, metadata);

      set(state => ({
        mediaItems: state.mediaItems.map(item => {
          // Check both id and _id properties
          const id = item.id || item._id;
          return id === itemId ? { ...item, ...updatedMedia } : item;
        }),
        filteredMediaItems: state.filteredMediaItems.map(item => {
          // Check both id and _id properties
          const id = item.id || item._id;
          return id === itemId ? { ...item, ...updatedMedia } : item;
        })
      }));

      return { success: true, data: updatedMedia };
    } catch (error) {
      console.error('Error updating media metadata:', error);
      set({ error: error.response?.data?.message || 'Failed to update media metadata' });
      return { success: false, error: error.message };
    }
  },

  // Add tags to media
  addMediaTags: async (itemId, tags) => {
    try {
      const updatedMedia = await mediaService.addMediaTags(itemId, tags);

      set(state => ({
        mediaItems: state.mediaItems.map(item => {
          // Check both id and _id properties
          const id = item.id || item._id;
          return id === itemId ? { ...item, tags: updatedMedia.tags } : item;
        }),
        filteredMediaItems: state.filteredMediaItems.map(item => {
          // Check both id and _id properties
          const id = item.id || item._id;
          return id === itemId ? { ...item, tags: updatedMedia.tags } : item;
        })
      }));

      return { success: true, data: updatedMedia };
    } catch (error) {
      console.error('Error adding media tags:', error);
      set({ error: error.response?.data?.message || 'Failed to add media tags' });
      return { success: false, error: error.message };
    }
  },

  // Remove tags from media
  removeMediaTags: async (itemId, tags) => {
    try {
      const updatedMedia = await mediaService.removeMediaTags(itemId, tags);

      set(state => ({
        mediaItems: state.mediaItems.map(item => {
          // Check both id and _id properties
          const id = item.id || item._id;
          return id === itemId ? { ...item, tags: updatedMedia.tags } : item;
        }),
        filteredMediaItems: state.filteredMediaItems.map(item => {
          // Check both id and _id properties
          const id = item.id || item._id;
          return id === itemId ? { ...item, tags: updatedMedia.tags } : item;
        })
      }));

      return { success: true, data: updatedMedia };
    } catch (error) {
      console.error('Error removing media tags:', error);
      set({ error: error.response?.data?.message || 'Failed to remove media tags' });
      return { success: false, error: error.message };
    }
  },

  // Clear all errors
  clearError: () => set({ error: null })
}));

export default dashboardStore
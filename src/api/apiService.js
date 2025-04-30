import api from './api';

/**
 * Authentication API Services
 */
export const authService = {
  // Helper to clear user cache
  clearUserCache: () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('userLastFetched');
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Store access token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      // The refresh token is automatically stored in HTTP-only cookie by the backend

      // Use user data from response if available
      let userData = response.data.user;

      // Only call getCurrentUser if user data wasn't provided
      if (!userData) {
        userData = await authService.getCurrentUser();
      }

      return {
        user: userData,
        ...response.data
      };
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
      // Remove access token from localStorage
      localStorage.removeItem('accessToken');
      // Clear user cache
      authService.clearUserCache();
      // The refresh token cookie is automatically cleared by the backend
      return { success: true };
    } catch (error) {
      // Even if the API call fails, clear local tokens
      localStorage.removeItem('accessToken');
      authService.clearUserCache();
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      // Check if we have user data cached and it's not outdated
      const cachedUser = sessionStorage.getItem('currentUser');
      const lastFetched = sessionStorage.getItem('userLastFetched');

      // Use cached version if available and less than 30 minutes old
      if (cachedUser && lastFetched) {
        const cacheAge = Date.now() - parseInt(lastFetched, 10);
        const cacheMaxAge = 30 * 60 * 1000; // 30 minutes

        if (cacheAge < cacheMaxAge) {
          console.log('Using cached user data');
          return JSON.parse(cachedUser);
        }
      }

      // Fetch fresh user data
      console.log('Fetching fresh user data');
      const response = await api.get('/auth/me');

      // Cache the response
      sessionStorage.setItem('currentUser', JSON.stringify(response.data));
      sessionStorage.setItem('userLastFetched', Date.now().toString());

      return response.data;
    } catch (error) {
      // Clear cache on error
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('userLastFetched');
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Refresh token - this is handled by the axios interceptor in api.js
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data;
    } catch (error) {
      // If refresh fails, clear tokens
      localStorage.removeItem('accessToken');
      throw error;
    }
  }
};

/**
 * User API Services
 */
export const userService = {
  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/user/profile', userData);
      console.log(`userData: ${response.data}`);

      // Clear user cache to force refresh
      authService.clearUserCache();

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user password
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/user/password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user settings
  getSettings: async () => {
    try {
      const response = await api.get('/user/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settingsData) => {
    try {
      const response = await api.put('/user/settings', settingsData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Media API Services
 */
export const mediaService = {
  // Get all media items
  getAllMedia: async (params = {}) => {
    try {
      console.log('📷 Fetching all media with params:', params);

      // Check if authenticated before making request
      if (!localStorage.getItem('accessToken')) {
        console.error('Trying to fetch media without being authenticated');
      }

      // Fixed URL - ensure consistency with trailing slash
      const response = await api.get('/media/', { params });

      // Check if the response contains data
      let mediaData = response.data;

      // Log what we got
      console.log('📊 Media data received:', mediaData);

      // Handle both array and object with data property responses
      return mediaData;
    } catch (error) {
      console.error('❌ Error fetching media:', error);

      // Log more detailed error info
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
      }

      throw error;
    }
  },

  // Get single media item by ID
  getMediaById: async (id) => {
    try {
      console.log(`🔍 Fetching media item by ID: ${id}`);
      const response = await api.get(`/media/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching media item ${id}:`, error);
      throw error;
    }
  },

  // Upload media files
  uploadMedia: async (formData, onUploadProgress) => {
    try {
      console.log('⬆️ Uploading media files');
      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress
      });
      console.log('✅ Upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  },

  // Delete media item
  deleteMedia: async (id) => {
    try {
      console.log(`🗑️ Deleting media item: ${id}`);
      const response = await api.delete(`/media/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting media item ${id}:`, error);
      throw error;
    }
  },

  // Update media metadata
  updateMediaMetadata: async (id, metadata) => {
    try {
      console.log(`📝 Updating metadata for media ${id}:`, metadata);
      const response = await api.put(`/media/${id}/metadata`, metadata);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating metadata for media ${id}:`, error);
      throw error;
    }
  },

  // Add tags to media
  addMediaTags: async (id, tags) => {
    try {
      console.log(`🏷️ Adding tags to media ${id}:`, tags);
      const response = await api.post(`/media/${id}/tags`, { tags });
      return response.data;
    } catch (error) {
      console.error(`❌ Error adding tags to media ${id}:`, error);
      throw error;
    }
  },

  // Remove tags from media
  removeMediaTags: async (id, tags) => {
    try {
      console.log(`🗑️🏷️ Removing tags from media ${id}:`, tags);
      const response = await api.delete(`/media/${id}/tags`, { data: { tags } });
      return response.data;
    } catch (error) {
      console.error(`❌ Error removing tags from media ${id}:`, error);
      throw error;
    }
  },

  // Search media
  searchMedia: async (query) => {
    try {
      console.log(`🔍 Searching media with query:`, query);
      const response = await api.get('/media/search', { params: query });
      return response.data;
    } catch (error) {
      console.error('❌ Search error:', error);
      throw error;
    }
  }
};

/**
 * Dashboard API Services
 */
export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recent activities
  getActivities: async (limit = 10) => {
    try {
      const response = await api.get('/dashboard/activities', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get content analytics
  getAnalytics: async () => {
    try {
      const response = await api.get('/dashboard/analytics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all dashboard data at once
  getAllDashboardData: async () => {
    try {
      const [stats, activities, analytics] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivities(),
        dashboardService.getAnalytics()
      ]);

      return {
        stats,
        activities,
        analytics
      };
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Collection API Services
 */
export const collectionService = {
  // Get all collections
  getAllCollections: async () => {
    try {
      const response = await api.get('/collection');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get collection by ID
  getCollectionById: async (id) => {
    try {
      const response = await api.get(`/collection/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new collection
  createCollection: async (collectionData) => {
    try {
      const response = await api.post('/collection', collectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update collection
  updateCollection: async (id, collectionData) => {
    try {
      const response = await api.put(`/collection/${id}`, collectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete collection
  deleteCollection: async (id) => {
    try {
      const response = await api.delete(`/collection/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add media to collection
  addMediaToCollection: async (collectionId, mediaIds) => {
    try {
      const response = await api.post(`/collection/${collectionId}/media`, { mediaIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove media from collection
  removeMediaFromCollection: async (collectionId, mediaIds) => {
    try {
      const response = await api.delete(`/collection/${collectionId}/media`, { data: { mediaIds } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * AI Processing API Services
 */
export const aiService = {
  // Process media with AI
  processMedia: async (mediaIds, options) => {
    try {
      const response = await api.post('/ai/process', { mediaIds, options });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get AI processing status
  getProcessingStatus: async (jobId) => {
    try {
      const response = await api.get(`/ai/status/${jobId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate AI tags for media
  generateTags: async (mediaId) => {
    try {
      const response = await api.post(`/ai/tags/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Perform OCR on document or image
  performOcr: async (mediaId) => {
    try {
      const response = await api.post(`/ai/ocr/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Transcribe audio or video
  transcribeMedia: async (mediaId) => {
    try {
      const response = await api.post(`/ai/transcribe/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate AI description for media
  generateDescription: async (mediaId) => {
    try {
      const response = await api.post(`/ai/describe/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Process media with custom AI prompt
  processWithPrompt: async (mediaIds, prompt) => {
    try {
      const response = await api.post('/ai/custom', { mediaIds, prompt });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Perform object recognition on image/video
  performObjectRecognition: async (mediaId) => {
    try {
      const response = await api.post(`/ai/object-recognition/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Summarize video or document
  summarizeMedia: async (mediaId) => {
    try {
      const response = await api.post(`/ai/summarize/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Analyze emotion in audio
  analyzeEmotion: async (mediaId) => {
    try {
      const response = await api.post(`/ai/emotion-analysis/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Identify speakers in audio
  identifySpeakers: async (mediaId) => {
    try {
      const response = await api.post(`/ai/speaker-identification/${mediaId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Search API Services
 */
export const searchService = {
  // Global search across all content
  globalSearch: async (query) => {
    try {
      const response = await api.get('/search', { params: { query } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced search with filters
  advancedSearch: async (searchParams) => {
    try {
      const response = await api.post('/search/advanced', searchParams);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Chat API Services
 */
export const chatService = {
  // Send messages to the AI chat endpoint
  sendMessage: async (messages) => {
    try {
      const response = await api.post('/chat', { messages });
      return response.data;
    } catch (error) {
      console.error('❌ Error in chat service:', error);
      throw error;
    }
  }
};


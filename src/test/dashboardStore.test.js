import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dashboardStore from '../store/dashboardStore';
import api from '../api/api';

// Mock the API module
vi.mock('../api/api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Dashboard Store', () => {
  let store;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset the store state before each test
    store = dashboardStore.getState();
    dashboardStore.setState({
      mediaItems: [],
      filteredMediaItems: [],
      isLoadingMedia: false,
      recentActivities: [],
      isLoadingActivities: false,
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
      searchQuery: '',
      selectedTags: [],
      viewMode: 'grid',
      error: null,
    });
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  describe('fetchMediaItems', () => {
    it('should fetch media items successfully', async () => {
      // Mock data
      const mockMediaItems = [
        { id: 1, name: 'Test Image', type: 'image', tags: ['test', 'image'] },
        { id: 2, name: 'Test Video', type: 'video', tags: ['test', 'video'] },
      ];

      // Mock API response
      api.get.mockResolvedValueOnce({ status: 200, data: mockMediaItems });

      // Call the action
      const { fetchMediaItems } = dashboardStore.getState();
      await fetchMediaItems();

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/media');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.mediaItems).toEqual(mockMediaItems);
      expect(state.filteredMediaItems).toEqual(mockMediaItems);
      expect(state.isLoadingMedia).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle errors when fetching media items', async () => {
      // Mock API error
      api.get.mockRejectedValueOnce(new Error('API Error'));

      // Call the action
      const { fetchMediaItems } = dashboardStore.getState();
      await fetchMediaItems();

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/media');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.mediaItems).toEqual([]);
      expect(state.isLoadingMedia).toBe(false);
      expect(state.error).toBe('Failed to load media items');
    });
  });

  describe('fetchRecentActivities', () => {
    it('should fetch recent activities successfully', async () => {
      // Mock data
      const mockActivities = [
        { id: 1, action: 'Upload', item: 'Test Image', user: 'User', time: '10 minutes ago' },
        { id: 2, action: 'Download', item: 'Test Video', user: 'User', time: '20 minutes ago' },
      ];

      // Mock API response
      api.get.mockResolvedValueOnce({ status: 200, data: mockActivities });

      // Call the action
      const { fetchRecentActivities } = dashboardStore.getState();
      await fetchRecentActivities();

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/activities');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.recentActivities).toEqual(mockActivities);
      expect(state.isLoadingActivities).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchDashboardStats', () => {
    it('should fetch dashboard stats successfully', async () => {
      // Mock data
      const mockStats = {
        totalAssets: 100,
        processing: 5,
        storageUsed: {
          percentage: 50,
          used: 25,
          total: 50
        },
        aiInsights: 10
      };

      // Mock API response
      api.get.mockResolvedValueOnce({ status: 200, data: mockStats });

      // Call the action
      const { fetchDashboardStats } = dashboardStore.getState();
      await fetchDashboardStats();

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/stats');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.stats).toEqual(mockStats);
      expect(state.isLoadingStats).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchContentAnalytics', () => {
    it('should fetch content analytics successfully', async () => {
      // Mock data
      const mockAnalytics = {
        mediaTypeDistribution: {
          images: 50,
          videos: 30,
          audio: 20
        },
        popularTags: [
          { name: 'marketing', count: 45 },
          { name: 'presentation', count: 32 }
        ],
        aiProcessingSavings: {
          efficiency: 68,
          timeSaved: 12.5
        }
      };

      // Mock API response
      api.get.mockResolvedValueOnce({ status: 200, data: mockAnalytics });

      // Call the action
      const { fetchContentAnalytics } = dashboardStore.getState();
      await fetchContentAnalytics();

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/analytics');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.analytics).toEqual(mockAnalytics);
      expect(state.isLoadingAnalytics).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchAllDashboardData', () => {
    it('should fetch all dashboard data in parallel', async () => {
      // Mock data
      const mockMediaItems = [{ id: 1, name: 'Test Image' }];
      const mockActivities = [{ id: 1, action: 'Upload' }];
      const mockStats = { totalAssets: 100 };
      const mockAnalytics = { mediaTypeDistribution: { images: 50 } };

      // Mock API responses
      api.get.mockImplementation((url) => {
        switch (url) {
          case '/api/dashboard/media':
            return Promise.resolve({ status: 200, data: mockMediaItems });
          case '/api/dashboard/activities':
            return Promise.resolve({ status: 200, data: mockActivities });
          case '/api/dashboard/stats':
            return Promise.resolve({ status: 200, data: mockStats });
          case '/api/dashboard/analytics':
            return Promise.resolve({ status: 200, data: mockAnalytics });
          default:
            return Promise.reject(new Error('Unknown URL'));
        }
      });

      // Call the action
      const { fetchAllDashboardData } = dashboardStore.getState();
      const result = await fetchAllDashboardData();

      // Verify API was called correctly for all endpoints
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/media');
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/activities');
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/stats');
      expect(api.get).toHaveBeenCalledWith('/api/dashboard/analytics');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.mediaItems).toEqual(mockMediaItems);
      expect(state.recentActivities).toEqual(mockActivities);
      expect(state.stats).toEqual(mockStats);
      expect(state.analytics).toEqual(mockAnalytics);
      expect(state.error).toBeNull();

      // Verify result
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteMediaItem', () => {
    it('should delete a media item successfully', async () => {
      // Setup initial state
      dashboardStore.setState({
        mediaItems: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ],
        filteredMediaItems: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      });

      // Mock API response
      api.delete.mockResolvedValueOnce({ status: 200 });
      api.get.mockResolvedValueOnce({ status: 200, data: { totalAssets: 1 } });

      // Call the action
      const { deleteMediaItem } = dashboardStore.getState();
      const result = await deleteMediaItem(1);

      // Verify API was called correctly
      expect(api.delete).toHaveBeenCalledWith('/api/dashboard/media/1');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.mediaItems).toEqual([{ id: 2, name: 'Item 2' }]);
      expect(state.filteredMediaItems).toEqual([{ id: 2, name: 'Item 2' }]);

      // Verify result
      expect(result).toEqual({ success: true });
    });
  });

  describe('Search and filter functionality', () => {
    beforeEach(() => {
      // Setup initial state with some media items
      dashboardStore.setState({
        mediaItems: [
          { id: 1, name: 'Marketing Presentation', tags: ['marketing', 'presentation'] },
          { id: 2, name: 'Product Demo', tags: ['product', 'demo'] },
          { id: 3, name: 'Team Photo', tags: ['team', 'photo'] }
        ],
        filteredMediaItems: [
          { id: 1, name: 'Marketing Presentation', tags: ['marketing', 'presentation'] },
          { id: 2, name: 'Product Demo', tags: ['product', 'demo'] },
          { id: 3, name: 'Team Photo', tags: ['team', 'photo'] }
        ]
      });
    });

    it('should filter media items by search query', () => {
      // Call the action
      const { setSearchQuery } = dashboardStore.getState();
      setSearchQuery('marketing');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.searchQuery).toBe('marketing');
      expect(state.filteredMediaItems).toEqual([
        { id: 1, name: 'Marketing Presentation', tags: ['marketing', 'presentation'] }
      ]);
    });

    it('should filter media items by tags', () => {
      // Call the action
      const { toggleTag } = dashboardStore.getState();
      toggleTag('team');

      // Verify state was updated correctly
      const state = dashboardStore.getState();
      expect(state.selectedTags).toEqual(['team']);
      expect(state.filteredMediaItems).toEqual([
        { id: 3, name: 'Team Photo', tags: ['team', 'photo'] }
      ]);
    });

    it('should toggle tags on and off', () => {
      // Call the action to add a tag
      const { toggleTag } = dashboardStore.getState();
      toggleTag('marketing');

      // Verify tag was added
      expect(dashboardStore.getState().selectedTags).toEqual(['marketing']);

      // Call the action again to remove the tag
      toggleTag('marketing');

      // Verify tag was removed
      expect(dashboardStore.getState().selectedTags).toEqual([]);
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, mediaService, dashboardService } from '../api/apiService';
import api from '../api/api';

// Mock the axios instance
vi.mock('../api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('API Services', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('authService', () => {
    it('should login a user', async () => {
      const mockResponse = { data: { accessToken: 'test-token', user: { id: 1, username: 'testuser' } } };
      api.post.mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password' };
      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('should register a new user', async () => {
      const mockResponse = { data: { id: 1, username: 'testuser', email: 'test@example.com' } };
      api.post.mockResolvedValue(mockResponse);

      const userData = { username: 'testuser', email: 'test@example.com', password: 'password' };
      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should logout a user', async () => {
      const mockResponse = { data: { success: true } };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual({ success: true });
    });

    it('should get current user profile', async () => {
      const mockResponse = { data: { id: 1, username: 'testuser', email: 'test@example.com' } };
      api.get.mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('mediaService', () => {
    it('should get all media items', async () => {
      const mockResponse = { data: [{ id: 1, name: 'test.jpg' }, { id: 2, name: 'test2.jpg' }] };
      api.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getAllMedia();

      expect(api.get).toHaveBeenCalledWith('/media', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get a single media item by ID', async () => {
      const mockResponse = { data: { id: 1, name: 'test.jpg' } };
      api.get.mockResolvedValue(mockResponse);

      const result = await mediaService.getMediaById(1);

      expect(api.get).toHaveBeenCalledWith('/media/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should upload media files', async () => {
      const mockResponse = { data: { success: true, files: [{ id: 1, name: 'test.jpg' }] } };
      api.post.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg');

      const result = await mediaService.uploadMedia(formData);

      expect(api.post).toHaveBeenCalledWith('/media/upload', formData, expect.any(Object));
      expect(result).toEqual(mockResponse.data);
    });

    it('should delete a media item', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await mediaService.deleteMedia(1);

      expect(api.delete).toHaveBeenCalledWith('/media/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('dashboardService', () => {
    it('should get dashboard statistics', async () => {
      const mockResponse = { 
        data: { 
          totalAssets: 10, 
          processing: 2,
          storageUsed: { percentage: 30, used: 300, total: 1000 },
          aiInsights: 5
        } 
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getStats();

      expect(api.get).toHaveBeenCalledWith('/dashboard/stats');
      expect(result).toEqual(mockResponse.data);
    });

    it('should get recent activities', async () => {
      const mockResponse = { 
        data: [
          { id: 1, type: 'upload', timestamp: '2023-01-01T00:00:00Z' },
          { id: 2, type: 'delete', timestamp: '2023-01-02T00:00:00Z' }
        ] 
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getActivities();

      expect(api.get).toHaveBeenCalledWith('/dashboard/activities', { params: { limit: 10 } });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get content analytics', async () => {
      const mockResponse = { 
        data: { 
          mediaTypeDistribution: { images: 5, videos: 3, audio: 2 },
          popularTags: ['nature', 'work', 'vacation'],
          aiProcessingSavings: { efficiency: 80, timeSaved: 120 }
        } 
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await dashboardService.getAnalytics();

      expect(api.get).toHaveBeenCalledWith('/dashboard/analytics');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
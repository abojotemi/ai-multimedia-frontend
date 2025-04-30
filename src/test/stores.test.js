import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore, useDashboardStore, useUploadStore } from '../store/store';
import { authService, mediaService, dashboardService } from '../api/apiService';

// Mock the API services
vi.mock('../api/apiService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  mediaService: {
    getAllMedia: vi.fn(),
    deleteMedia: vi.fn(),
    uploadMedia: vi.fn(),
  },
  dashboardService: {
    getStats: vi.fn(),
    getActivities: vi.fn(),
    getAnalytics: vi.fn(),
  },
}));

describe('Zustand Stores', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset the stores
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      useDashboardStore.setState({
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
      
      useUploadStore.setState({
        files: [],
        uploadProgress: {},
        isUploading: false,
        isProcessing: false,
        previewFile: null,
        previewOpen: false,
        processingOptions: { 
          ocr: false, 
          transcription: false,
          generateTags: true
        },
        error: null,
      });
    });
  });

  describe('authStore', () => {
    it('should set user data', () => {
      const { result } = renderHook(() => useAuthStore());
      const userData = { id: 1, username: 'testuser', email: 'test@example.com' };
      
      act(() => {
        result.current.setUser(userData);
      });
      
      expect(result.current.user).toEqual(userData);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should login a user', async () => {
      const { result } = renderHook(() => useAuthStore());
      const userData = { id: 1, username: 'testuser', email: 'test@example.com' };
      const credentials = { email: 'test@example.com', password: 'password' };
      
      authService.login.mockResolvedValue({ user: userData });
      
      await act(async () => {
        await result.current.login(credentials);
      });
      
      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.user).toEqual(userData);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle login errors', async () => {
      const { result } = renderHook(() => useAuthStore());
      const credentials = { email: 'test@example.com', password: 'password' };
      const error = new Error('Invalid credentials');
      error.response = { data: { message: 'Invalid credentials' } };
      
      authService.login.mockRejectedValue(error);
      
      await act(async () => {
        await result.current.login(credentials);
      });
      
      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isLoading).toBe(false);
    });

    it('should logout a user', async () => {
      const { result } = renderHook(() => useAuthStore());
      
      // First set a user
      act(() => {
        result.current.setUser({ id: 1, username: 'testuser' });
      });
      
      authService.logout.mockResolvedValue({ success: true });
      
      await act(async () => {
        await result.current.logout();
      });
      
      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('dashboardStore', () => {
    it('should fetch media items', async () => {
      const { result } = renderHook(() => useDashboardStore());
      const mediaItems = [
        { id: 1, name: 'test1.jpg', tags: ['photo', 'vacation'] },
        { id: 2, name: 'test2.jpg', tags: ['photo', 'work'] }
      ];
      
      mediaService.getAllMedia.mockResolvedValue(mediaItems);
      
      await act(async () => {
        await result.current.fetchMediaItems();
      });
      
      expect(mediaService.getAllMedia).toHaveBeenCalled();
      expect(result.current.mediaItems).toEqual(mediaItems);
      expect(result.current.filteredMediaItems).toEqual(mediaItems);
      expect(result.current.isLoadingMedia).toBe(false);
    });

    it('should filter media items by search query', async () => {
      const { result } = renderHook(() => useDashboardStore());
      const mediaItems = [
        { id: 1, name: 'vacation.jpg', tags: ['photo', 'vacation'] },
        { id: 2, name: 'work.jpg', tags: ['photo', 'work'] }
      ];
      
      // First set media items
      act(() => {
        useDashboardStore.setState({ 
          mediaItems, 
          filteredMediaItems: mediaItems 
        });
      });
      
      // Then search for "vacation"
      act(() => {
        result.current.setSearchQuery('vacation');
      });
      
      expect(result.current.searchQuery).toBe('vacation');
      expect(result.current.filteredMediaItems).toEqual([mediaItems[0]]);
    });

    it('should filter media items by tags', async () => {
      const { result } = renderHook(() => useDashboardStore());
      const mediaItems = [
        { id: 1, name: 'vacation.jpg', tags: ['photo', 'vacation'] },
        { id: 2, name: 'work.jpg', tags: ['photo', 'work'] }
      ];
      
      // First set media items
      act(() => {
        useDashboardStore.setState({ 
          mediaItems, 
          filteredMediaItems: mediaItems 
        });
      });
      
      // Then filter by "work" tag
      act(() => {
        result.current.toggleTag('work');
      });
      
      expect(result.current.selectedTags).toEqual(['work']);
      expect(result.current.filteredMediaItems).toEqual([mediaItems[1]]);
    });

    it('should delete a media item', async () => {
      const { result } = renderHook(() => useDashboardStore());
      const mediaItems = [
        { id: 1, name: 'test1.jpg', tags: ['photo'] },
        { id: 2, name: 'test2.jpg', tags: ['photo'] }
      ];
      
      // First set media items
      act(() => {
        useDashboardStore.setState({ 
          mediaItems, 
          filteredMediaItems: mediaItems 
        });
      });
      
      mediaService.deleteMedia.mockResolvedValue({ success: true });
      
      await act(async () => {
        await result.current.deleteMediaItem(1);
      });
      
      expect(mediaService.deleteMedia).toHaveBeenCalledWith(1);
      expect(result.current.mediaItems).toEqual([mediaItems[1]]);
      expect(result.current.filteredMediaItems).toEqual([mediaItems[1]]);
    });
  });

  describe('uploadStore', () => {
    it('should process new files', () => {
      const { result } = renderHook(() => useUploadStore());
      
      // Create a mock file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      act(() => {
        result.current.processNewFiles([file]);
      });
      
      expect(result.current.files.length).toBe(1);
      expect(result.current.files[0].name).toBe('test.jpg');
      expect(result.current.files[0].type).toBe('image');
    });

    it('should remove a file', () => {
      const { result } = renderHook(() => useUploadStore());
      
      // First add a file
      act(() => {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        result.current.processNewFiles([file]);
      });
      
      const fileId = result.current.files[0].id;
      
      act(() => {
        result.current.removeFile(fileId);
      });
      
      expect(result.current.files.length).toBe(0);
    });

    it('should upload files', async () => {
      const { result } = renderHook(() => useUploadStore());
      
      // First add a file
      act(() => {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        result.current.processNewFiles([file]);
      });
      
      mediaService.uploadMedia.mockResolvedValue({ success: true, files: [{ id: 1, name: 'test.jpg' }] });
      
      await act(async () => {
        await result.current.uploadFiles();
      });
      
      expect(mediaService.uploadMedia).toHaveBeenCalled();
      expect(result.current.files.length).toBe(0);
      expect(result.current.isUploading).toBe(false);
    });
  });
});
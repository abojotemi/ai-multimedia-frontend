import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import useAuthStore from '../store/authStore';
import { authService } from '../api/apiService';

// Mock the auth service
vi.mock('../api/apiService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    refreshToken: vi.fn(),
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    window.localStorage.clear();
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Reset all mocks after each test
    vi.resetAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should login successfully', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    authService.login.mockResolvedValue({ 
      user: mockUser,
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token'
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.login({ email: 'test@example.com', password: 'password' });
    });

    // Wait for the async action to complete
    await waitForNextUpdate();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(authService.login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password' 
    });
  });

  it('should handle login failure', async () => {
    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValue({ 
      response: { data: { detail: errorMessage } } 
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.login({ email: 'test@example.com', password: 'wrong' });
    });

    // Wait for the async action to complete
    await waitForNextUpdate();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should logout successfully', async () => {
    // First set the user as logged in
    const { result, waitForNextUpdate } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setUser({ id: '1', username: 'testuser' });
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Mock successful logout
    authService.logout.mockResolvedValue({ success: true });

    act(() => {
      result.current.logout();
    });

    // Wait for the async action to complete
    await waitForNextUpdate();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should initialize auth state correctly', async () => {
    // Mock localStorage having a token
    window.localStorage.setItem('accessToken', 'fake-token');
    
    // Mock isAuthenticated to return true
    authService.isAuthenticated.mockReturnValue(true);
    
    // Mock getCurrentUser to return a user
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    authService.getCurrentUser.mockResolvedValue(mockUser);

    const { result, waitForNextUpdate } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.initAuth();
    });

    // Wait for the async action to complete
    await waitForNextUpdate();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle token refresh', async () => {
    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    };
    
    authService.refreshToken.mockResolvedValue(mockTokens);

    const { result, waitForNextUpdate } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.refreshToken();
    });

    // Wait for the async action to complete
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(authService.refreshToken).toHaveBeenCalled();
  });

  it('should handle token refresh failure', async () => {
    const errorMessage = 'Token refresh failed';
    authService.refreshToken.mockRejectedValue({ 
      response: { data: { message: errorMessage } } 
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuthStore());
    
    // First set the user as logged in
    act(() => {
      result.current.setUser({ id: '1', username: 'testuser' });
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.refreshToken();
    });

    // Wait for the async action to complete
    await waitForNextUpdate();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });
});
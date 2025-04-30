import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import api from '../api/api';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })),
    post: vi.fn()
  }
}));

describe('API Configuration', () => {
  it('should create axios instance with correct base URL', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://ai-multimedia-backend.onrender.com/api",
      withCredentials: true
    });
  });

  it('should use correct refresh token URL in interceptor', async () => {
    // Get the response interceptor function
    const responseInterceptor = axios.create().interceptors.response.use.mock.calls[0][1];
    
    // Mock error with 401 status
    const mockError = {
      response: { status: 401 },
      config: { _retry: false, headers: {} }
    };
    
    // Mock axios.post for the refresh token call
    axios.post.mockResolvedValueOnce({
      data: { accessToken: 'new-token' }
    });
    
    try {
      await responseInterceptor(mockError);
    } catch (e) {
      // We expect this to throw since api() is not fully mocked
    }
    
    // Check that the refresh token URL is correct
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/auth/refresh",
      {},
      { withCredentials: true }
    );
  });
});
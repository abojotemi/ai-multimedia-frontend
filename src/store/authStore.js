import { create } from 'zustand'
import { authService } from '../api/apiService'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            
            // Initialize auth state from localStorage
            initAuth: async () => {
                set({ isLoading: true });
                
                // Check if we have a token
                if (!authService.isAuthenticated()) {
                    set({ 
                        user: null,
                        isAuthenticated: false,
                        isLoading: false 
                    });
                    return;
                }
                
                // Try to get user data with the token
                try {
                    const userData = await authService.getCurrentUser();
                    set({ 
                        user: userData,
                        isAuthenticated: true,
                        isLoading: false 
                    });
                } catch (error) {
                    // If token is invalid, clear auth state
                    set({ 
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.response?.status === 401 ? null : (error.response?.data?.message || 'Authentication failed')
                    });
                }
            },
            
            // Set user data
            setUser: (userData) => 
                set(() => ({
                    user: userData,
                    isAuthenticated: !!userData,
                })),
            
            // Login user
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.login(credentials);
                    set({ 
                        user: data.user,
                        isAuthenticated: true,
                        isLoading: false 
                    });
                    return { success: true };
                } catch (error) {
                    set({ 
                        error: error.response?.data?.detail || error.response?.data?.message || 'Login failed',
                        isLoading: false 
                    });
                    return { 
                        success: false, 
                        error: error.response?.data?.detail || error.response?.data?.message || 'Login failed' 
                    };
                }
            },
            
            // Register new user
            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.register(userData);
                    set({ isLoading: false });
                    return { success: true, data };
                } catch (error) {
                    set({ 
                        error: error.response?.data?.detail || error.response?.data?.message || 'Registration failed',
                        isLoading: false 
                    });
                    return { 
                        success: false, 
                        error: error.response?.data?.detail || error.response?.data?.message || 'Registration failed' 
                    };
                }
            },
            
            // Logout user
            logout: async () => {
                set({ isLoading: true, error: null });
                try {
                    await authService.logout();
                    set({ 
                        user: null,
                        isAuthenticated: false,
                        isLoading: false 
                    });
                    return { success: true };
                } catch (error) {
                    // Even if logout fails on the server, clear local state
                    set({ 
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.response?.data?.message || 'Logout failed'
                    });
                    return { 
                        success: true, // Consider logout successful even if API fails
                        error: error.response?.data?.message || 'Logout failed on server but cleared locally' 
                    };
                }
            },
            
            // Get current user profile
            getCurrentUser: async () => {
                set({ isLoading: true, error: null });
                try {
                    const userData = await authService.getCurrentUser();
                    set({ 
                        user: userData,
                        isAuthenticated: true,
                        isLoading: false 
                    });
                    return { success: true, user: userData };
                } catch (error) {
                    set({ 
                        user: null,
                        isAuthenticated: false,
                        error: error.response?.status === 401 ? null : (error.response?.data?.message || 'Failed to get user data'),
                        isLoading: false 
                    });
                    return { 
                        success: false, 
                        error: error.response?.data?.message || 'Failed to get user data' 
                    };
                }
            },
            
            // Refresh token
            refreshToken: async () => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.refreshToken();
                    set({ isLoading: false });
                    return { success: true, data };
                } catch (error) {
                    set({ 
                        user: null,
                        isAuthenticated: false,
                        error: error.response?.data?.message || 'Token refresh failed',
                        isLoading: false 
                    });
                    return { 
                        success: false, 
                        error: error.response?.data?.message || 'Token refresh failed' 
                    };
                }
            },
            
            // Clear error
            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage', // name of the item in localStorage
            partialize: (state) => ({ 
                isAuthenticated: state.isAuthenticated,
                // Don't store sensitive data like tokens or full user object
            }),
        }
    )
);

export default useAuthStore


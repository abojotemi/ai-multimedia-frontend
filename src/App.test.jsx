import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import useAuthStore from './store/authStore';

// Mock the auth store
vi.mock('./store/authStore', () => ({
  default: vi.fn()
}));

// Mock the components
vi.mock('./components/Login', () => ({
  default: () => <div data-testid="login-component">Login Component</div>
}));

vi.mock('./components/Dashboard', () => ({
  default: () => <div data-testid="dashboard-component">Dashboard Component</div>
}));

vi.mock('./utils/ProtectedRoutes', () => ({
  default: ({ children }) => children
}));

vi.mock('./layouts/AuthLayout', () => ({
  default: ({ children }) => <div data-testid="auth-layout">{children}</div>
}));

vi.mock('./layouts/DashboardLayout', () => ({
  default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>
}));

describe('App Routing', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  it('redirects to login when not authenticated', () => {
    // Mock auth store to return not authenticated
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      initAuth: vi.fn().mockResolvedValue(undefined)
    });

    // Render the app
    render(<App />);
    
    // Check that we're redirected to login
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
  });

  it('redirects to dashboard when authenticated', () => {
    // Mock auth store to return authenticated
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      initAuth: vi.fn().mockResolvedValue(undefined)
    });

    // Render the app
    render(<App />);
    
    // Check that we're redirected to dashboard
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

vi.mock('./components/Register', () => ({
  default: () => <div data-testid="register-component">Register Component</div>
}));

vi.mock('./components/Dashboard', () => ({
  default: () => <div data-testid="dashboard-component">Dashboard Component</div>
}));

vi.mock('./components/Upload', () => ({
  default: () => <div data-testid="upload-component">Upload Component</div>
}));

vi.mock('./components/AIProcessing', () => ({
  default: () => <div data-testid="ai-processing-component">AI Processing Component</div>
}));

vi.mock('./components/Settings', () => ({
  default: () => <div data-testid="settings-component">Settings Component</div>
}));

// Mock the layouts
vi.mock('./layouts/AuthLayout', () => ({
  default: ({ children }) => <div data-testid="auth-layout">{children}</div>
}));

vi.mock('./layouts/DashboardLayout', () => ({
  default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>
}));

// Mock the protected route
vi.mock('./utils/ProtectedRoutes', () => ({
  default: ({ children }) => <div data-testid="protected-route">{children}</div>
}));

describe('Routing Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Default mock implementation for auth store
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      initAuth: vi.fn().mockResolvedValue(undefined)
    });
  });

  it('redirects to login when accessing root path and not authenticated', () => {
    render(<App />);
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
  });

  it('redirects to dashboard when accessing root path and authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      initAuth: vi.fn().mockResolvedValue(undefined)
    });
    
    render(<App />);
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
  });

  it('shows login page when accessing /login and not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
  });

  it('redirects to dashboard when accessing /login and authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      initAuth: vi.fn().mockResolvedValue(undefined)
    });
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
  });

  it('shows register page when accessing /register and not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('register-component')).toBeInTheDocument();
  });

  it('redirects to dashboard when accessing /register and authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      initAuth: vi.fn().mockResolvedValue(undefined)
    });
    
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
  });

  it('redirects to login when accessing protected route and not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
  });

  it('shows dashboard when accessing /dashboard and authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      initAuth: vi.fn().mockResolvedValue(undefined)
    });
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
  });
});
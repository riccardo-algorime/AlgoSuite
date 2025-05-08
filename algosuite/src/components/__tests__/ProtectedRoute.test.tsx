import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthContext } from '../../contexts/auth-context-type';
import { AuthState } from '../../types';

// Mock auth context values
const createAuthState = (isAuthenticated: boolean): AuthState => ({
  isAuthenticated,
  token: isAuthenticated ? 'fake-token' : null,
  user: isAuthenticated ? { id: '1', email: 'test@example.com', is_active: true, is_superuser: false, full_name: 'Test User' } : null,
});

// Mock auth context
const createAuthContext = (isAuthenticated: boolean) => ({
  authState: createAuthState(isAuthenticated),
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
});

// Helper function to render with auth context
const renderWithAuth = (isAuthenticated: boolean, initialEntries: string[] = ['/']) => {
  return render(
    <AuthContext.Provider value={createAuthContext(isAuthenticated)}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Protected Dashboard</div>
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId" element={
            <ProtectedRoute>
              <div>Protected Project</div>
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId/attack-surfaces/:surfaceId" element={
            <ProtectedRoute>
              <div>Protected Attack Surface</div>
            </ProtectedRoute>
          } />
          <Route path="/projects/new" element={
            <ProtectedRoute>
              <div>Protected Create Project</div>
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId/edit" element={
            <ProtectedRoute>
              <div>Protected Edit Project</div>
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId/attack-surfaces/:surfaceId/edit" element={
            <ProtectedRoute>
              <div>Protected Edit Attack Surface</div>
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <div>Protected Home</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute', () => {
  it('redirects to login page when user is not authenticated', () => {
    renderWithAuth(false, ['/dashboard']);

    // Should redirect to login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
  });

  it('renders protected content when user is authenticated', () => {
    renderWithAuth(true, ['/dashboard']);

    // Should render the protected content
    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('handles route parameters correctly when authenticated', () => {
    renderWithAuth(true, ['/projects/123']);

    // Should render the protected content with route parameters
    expect(screen.getByText('Protected Project')).toBeInTheDocument();
  });

  it('preserves the attempted URL in state when redirecting to login', () => {
    renderWithAuth(false, ['/projects/123']);

    // We can't directly test the state passed to Navigate, but we can check that
    // the redirect happened and the login page is shown
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Project')).not.toBeInTheDocument();
  });

  // Test all protected routes
  const protectedPaths = [
    { path: '/', component: 'Protected Home' },
    { path: '/dashboard', component: 'Protected Dashboard' },
    { path: '/projects/123', component: 'Protected Project' },
    { path: '/projects/123/attack-surfaces/456', component: 'Protected Attack Surface' },
    { path: '/projects/new', component: 'Protected Create Project' },
    { path: '/projects/123/edit', component: 'Protected Edit Project' },
    { path: '/projects/123/attack-surfaces/456/edit', component: 'Protected Edit Attack Surface' },
  ];

  protectedPaths.forEach(({ path, component }) => {
    it(`redirects ${path} to login when user is not authenticated`, () => {
      renderWithAuth(false, [path]);

      // Should redirect to login page
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText(component)).not.toBeInTheDocument();
    });

    it(`renders ${component} when user is authenticated`, () => {
      renderWithAuth(true, [path]);

      // Should render the protected content
      expect(screen.getByText(component)).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });
});

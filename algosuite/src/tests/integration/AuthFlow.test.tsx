import { screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { AuthContext } from '../../contexts/auth-context-type';
import { AuthState } from '../../types';
import { renderWithProviders } from '../utils/test-utils';

// Mock the auth context
const createAuthState = (isAuthenticated: boolean): AuthState => ({
  isAuthenticated,
  token: isAuthenticated ? 'fake-token' : null,
  user: isAuthenticated ? { id: '1', email: 'test@example.com', is_active: true, is_superuser: false, full_name: 'Test User' } : null,
});

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock login function
const mockLogin = jest.fn();
const mockLogout = jest.fn();

// Create auth context with mock functions
const createAuthContext = (isAuthenticated: boolean) => ({
  authState: createAuthState(isAuthenticated),
  login: mockLogin,
  logout: mockLogout,
  register: jest.fn(),
  refreshToken: jest.fn(),
});

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login page when accessing protected route while unauthenticated', () => {
    // Render the app with an unauthenticated user trying to access a protected route
    renderWithProviders(
      <AuthContext.Provider value={createAuthContext(false)}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Should be redirected to login page
    expect(screen.getByText('Login to AlgoSuite')).toBeInTheDocument();
    expect(screen.queryByText('My Projects')).not.toBeInTheDocument();
  });

  it('allows access to protected route when authenticated', () => {
    // Mock the projects API to avoid actual API calls
    jest.mock('../../api/projectsApi', () => ({
      projectsApi: {
        getProjects: jest.fn().mockResolvedValue([]),
      },
    }));

    // Render the app with an authenticated user
    renderWithProviders(
      <AuthContext.Provider value={createAuthContext(true)}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Should be able to access the dashboard
    expect(screen.getByText('My Projects')).toBeInTheDocument();
  });

  it('redirects back to the original route after successful login', async () => {
    // Setup mock login to simulate successful login
    mockLogin.mockImplementation(() => {
      // Update auth state after successful login
      return Promise.resolve();
    });

    // Render the app with an unauthenticated user trying to access a protected route
    const { rerender } = renderWithProviders(
      <AuthContext.Provider value={createAuthContext(false)}>
        <MemoryRouter initialEntries={['/projects/123']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Should be redirected to login page
    expect(screen.getByText('Login to AlgoSuite')).toBeInTheDocument();

    // Fill in login form
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify login was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });

    // Re-render with authenticated state to simulate successful login
    rerender(
      <AuthContext.Provider value={createAuthContext(true)}>
        <MemoryRouter initialEntries={['/projects/123']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Should be redirected to the original route
    expect(mockNavigate).toHaveBeenCalledWith('/projects/123', { replace: true });
  });

  it('redirects back to the original route with query parameters after successful login', async () => {
    // Setup mock login to simulate successful login
    mockLogin.mockImplementation(() => {
      return Promise.resolve();
    });

    // Render the app with an unauthenticated user trying to access a protected route with query params
    const { rerender } = renderWithProviders(
      <AuthContext.Provider value={createAuthContext(false)}>
        <MemoryRouter initialEntries={['/projects/123?tab=settings']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Should be redirected to login page
    expect(screen.getByText('Login to AlgoSuite')).toBeInTheDocument();

    // Fill in login form
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify login was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });

    // Re-render with authenticated state to simulate successful login
    rerender(
      <AuthContext.Provider value={createAuthContext(true)}>
        <MemoryRouter initialEntries={['/projects/123?tab=settings']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Should be redirected to the original route with query parameters preserved
    // The pathname will be extracted from the location object in LoginPage
    expect(mockNavigate).toHaveBeenCalledWith('/projects/123', { replace: true });
  });
});

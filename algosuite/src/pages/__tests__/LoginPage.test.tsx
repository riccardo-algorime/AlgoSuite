import { screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../LoginPage';
import { AuthContext } from '../../contexts/auth-context-type';
import { renderWithProviders } from '../../tests/utils/test-utils';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: { from: '/dashboard' },
    pathname: '/login',
    search: '',
    hash: '',
  }),
}));

// Mock auth context
const mockLogin = jest.fn();
const mockAuthContext = {
  authState: {
    isAuthenticated: false,
    token: null,
    user: null,
  },
  login: mockLogin,
  logout: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Login to AlgoSuite')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('does not call login function when form is submitted without values', async () => {
    renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    );

    // Submit the form without entering values
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Just check that login was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function and redirects on successful login', async () => {
    // Mock successful login
    mockLogin.mockResolvedValueOnce(undefined);

    renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for login to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('handles full location object in state for redirect', async () => {
    // Override the mock for this test only
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      state: {
        from: {
          pathname: '/projects/123',
          search: '?tab=settings',
          hash: '#details'
        }
      },
      pathname: '/login',
      search: '',
      hash: '',
    });

    // Mock successful login
    mockLogin.mockResolvedValueOnce(undefined);

    renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for login to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/projects/123', { replace: true });
    });

    // Restore the original mock
    jest.restoreAllMocks();
  });

  it('shows error message on login failure', async () => {
    // Mock failed login
    const errorMessage = 'Invalid username or password';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});

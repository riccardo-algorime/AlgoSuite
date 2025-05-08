import { screen, fireEvent } from '@testing-library/react';
import { NotFoundPage } from '../NotFoundPage';
import { AuthContext } from '../../contexts/auth-context-type';
import { renderWithProviders } from '../../tests/utils/test-utils';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock auth context
const createAuthContext = (isAuthenticated: boolean) => ({
  authState: {
    isAuthenticated,
    token: isAuthenticated ? 'fake-token' : null,
    user: isAuthenticated ? { id: '1', email: 'test@example.com', is_active: true, is_superuser: false, full_name: 'Test User' } : null,
  },
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
});

describe('NotFoundPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 404 page correctly', () => {
    renderWithProviders(
      <AuthContext.Provider value={createAuthContext(false)}>
        <NotFoundPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText(/The page you are looking for doesn't exist or has been moved./)).toBeInTheDocument();
  });

  it('navigates to home page when not authenticated', () => {
    renderWithProviders(
      <AuthContext.Provider value={createAuthContext(false)}>
        <NotFoundPage />
      </AuthContext.Provider>
    );

    // Button should say "Go Home"
    const button = screen.getByRole('button', { name: 'Go Home' });
    expect(button).toBeInTheDocument();

    // Click the button
    fireEvent.click(button);

    // Should navigate to home page
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to dashboard when authenticated', () => {
    renderWithProviders(
      <AuthContext.Provider value={createAuthContext(true)}>
        <NotFoundPage />
      </AuthContext.Provider>
    );

    // Button should say "Go to Dashboard"
    const button = screen.getByRole('button', { name: 'Go to Dashboard' });
    expect(button).toBeInTheDocument();

    // Click the button
    fireEvent.click(button);

    // Should navigate to dashboard
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

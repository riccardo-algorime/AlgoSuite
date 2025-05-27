import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../RegisterPage';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the useAuth hook
const mockRegister = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderRegisterPage = () => {
  return render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form with separate first and last name fields', () => {
    renderRegisterPage();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('shows validation error when fields are missing', async () => {
    renderRegisterPage();
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
  });

  test('combines first and last name correctly when submitting', async () => {
    mockRegister.mockResolvedValue({});
    
    renderRegisterPage();
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'test@example.com',
        'John Doe',  // Combined full name
        'Password123!'
      );
    });
  });

  test('handles single word names correctly', async () => {
    mockRegister.mockResolvedValue({});
    
    renderRegisterPage();
    
    // Fill out the form with single word names
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Smith' }
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'test@example.com',
        'John Smith',
        'Password123!'
      );
    });
  });

  test('validates that both first and last names are required', async () => {
    renderRegisterPage();
    
    // Fill out form but leave last name empty
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' }
    });
    // Leave last name empty
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
    
    expect(mockRegister).not.toHaveBeenCalled();
  });
});

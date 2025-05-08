import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { AttackSurface, SurfaceType } from '../../types';

// Mock toaster from components/ui/toaster
jest.mock('../../components/ui/toaster', () => ({
  toaster: {
    error: jest.fn(),
    success: jest.fn(),
    create: jest.fn(),
  },
}));

// Import after mocks
import { AttackSurfacePage } from '../AttackSurfacePage';
import { projectsApi } from '../../api/projectsApi';

// Mock the projectsApi
jest.mock('../../api/projectsApi', () => ({
  projectsApi: {
    getAttackSurface: jest.fn(),
  },
}));

// Mock the react-router-dom's useNavigate and useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ projectId: '1', surfaceId: '2' }),
}));

// Mock attack surface data
const mockAttackSurface: AttackSurface = {
  id: '2',
  project_id: '1',
  surface_type: SurfaceType.WEB,
  description: 'Test attack surface description',
  config: {
    url: 'https://example.com',
    scope: 'full',
    includeSubdomains: true,
  },
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-02T12:00:00Z',
};

describe('AttackSurfacePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Setup - mock loading state
    (projectsApi.getAttackSurface as jest.Mock).mockReturnValue(new Promise(() => {}));

    // Render the component
    renderWithProviders(<AttackSurfacePage />);

    // Check if loading spinner is displayed
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders attack surface details when data is loaded', async () => {
    // Setup - mock successful response
    (projectsApi.getAttackSurface as jest.Mock).mockResolvedValue(mockAttackSurface);

    // Render the component
    renderWithProviders(<AttackSurfacePage />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check if attack surface details are displayed
    expect(screen.getByText('Web Attack Surface')).toBeInTheDocument();
    expect(screen.getByText('Test attack surface description')).toBeInTheDocument();
    expect(screen.getByText('Surface ID:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Project ID:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Check if configuration is displayed
    expect(screen.getByText('Configuration')).toBeInTheDocument();

    // The JSON should be displayed in a code block
    const codeBlock = screen.getByText((content) => {
      return content.includes('"url": "https://example.com"') &&
             content.includes('"scope": "full"') &&
             content.includes('"includeSubdomains": true');
    });
    expect(codeBlock).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    // Setup - mock error response
    const error = new Error('Failed to load attack surface');
    (projectsApi.getAttackSurface as jest.Mock).mockRejectedValue(error);

    // Render the component
    renderWithProviders(<AttackSurfacePage />);

    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByText('Error Loading Attack Surface')).toBeInTheDocument();
    });

    // Check if error message is displayed
    expect(screen.getByText('Failed to load attack surface')).toBeInTheDocument();
  });

  it('navigates back to project page when back button is clicked', async () => {
    // Setup - mock successful response
    (projectsApi.getAttackSurface as jest.Mock).mockResolvedValue(mockAttackSurface);

    // Render the component
    renderWithProviders(<AttackSurfacePage />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Find and click the back button
    const backButton = screen.getByText('← Back to Project');
    backButton.click();

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });
});

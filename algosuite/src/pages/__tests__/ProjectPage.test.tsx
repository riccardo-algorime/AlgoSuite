import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { Project, AttackSurface, SurfaceType } from '../../types';

// Mock toaster from components/ui/toaster
jest.mock('../../components/ui/toaster', () => ({
  toaster: {
    error: jest.fn(),
    success: jest.fn(),
    create: jest.fn(),
  },
}));

// Import after mocks
import { ProjectPage } from '../ProjectPage';
import { projectsApi } from '../../api/projectsApi';

// Mock the projectsApi
jest.mock('../../api/projectsApi', () => ({
  projectsApi: {
    getProject: jest.fn(),
    getAttackSurfaces: jest.fn(),
  },
}));

// Mock the react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ projectId: '1' }),
}));

// Get the mocked toaster for assertions
const mockToaster = jest.requireMock('../../components/ui/toaster').toaster;

// Mock project data
const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'This is a test project description',
  created_by: 'user-123',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-02T12:00:00Z',
};

// Mock attack surfaces data
const mockAttackSurfaces: AttackSurface[] = [
  {
    id: '1',
    project_id: '1',
    surface_type: SurfaceType.WEB,
    description: 'Web application frontend',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-02T12:00:00Z',
  },
  {
    id: '2',
    project_id: '1',
    surface_type: SurfaceType.API,
    description: 'REST API endpoints',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-02T12:00:00Z',
  },
];

describe('ProjectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Setup - mock loading state
    (projectsApi.getProject as jest.Mock).mockReturnValue(new Promise(() => {}));
    (projectsApi.getAttackSurfaces as jest.Mock).mockReturnValue(new Promise(() => {}));

    // Render the component
    renderWithProviders(<ProjectPage />);

    // Check if loading spinner is displayed
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders project details and attack surfaces when data is loaded', async () => {
    // Setup - mock successful responses
    (projectsApi.getProject as jest.Mock).mockResolvedValue(mockProject);
    (projectsApi.getAttackSurfaces as jest.Mock).mockResolvedValue(mockAttackSurfaces);

    // Render the component
    renderWithProviders(<ProjectPage />);

    // Wait for the project details to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Verify project details are rendered
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();
    expect(screen.getAllByText(/Created:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Last updated:/).length).toBeGreaterThan(0);

    // Verify attack surfaces are rendered in the table
    expect(screen.getByText('Web')).toBeInTheDocument();
    expect(screen.getByText('Web application frontend')).toBeInTheDocument();
    expect(screen.getByText('Api')).toBeInTheDocument();
    expect(screen.getByText('REST API endpoints')).toBeInTheDocument();

    // Verify table headers
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders error state when project fetch fails', async () => {
    // Setup - mock error response for project
    (projectsApi.getProject as jest.Mock).mockRejectedValue(new Error('Failed to load project'));
    (projectsApi.getAttackSurfaces as jest.Mock).mockResolvedValue(mockAttackSurfaces);

    // Render the component
    renderWithProviders(<ProjectPage />);

    // Wait for the error state to be rendered
    await waitFor(() => {
      expect(screen.getByText('Project Not Found')).toBeInTheDocument();
    });

    // Verify error message is displayed
    expect(screen.getByText(/The project you're looking for could not be found/)).toBeInTheDocument();

    // Verify toast was called with error message
    expect(mockToaster.error).toHaveBeenCalledWith(
      'Error loading project',
      expect.anything()
    );
  });

  it('navigates to attack surface page when View button is clicked', async () => {
    // Setup - mock successful responses
    (projectsApi.getProject as jest.Mock).mockResolvedValue(mockProject);
    (projectsApi.getAttackSurfaces as jest.Mock).mockResolvedValue(mockAttackSurfaces);

    // Render the component
    renderWithProviders(<ProjectPage />);

    // Wait for the attack surfaces to load
    await waitFor(() => {
      expect(screen.getAllByText('View')[0]).toBeInTheDocument();
    });

    // Find and click the first View button
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1/attack-surfaces/1');
  });

  it('navigates back to dashboard when Back button is clicked', async () => {
    // Setup - mock successful responses
    (projectsApi.getProject as jest.Mock).mockResolvedValue(mockProject);
    (projectsApi.getAttackSurfaces as jest.Mock).mockResolvedValue(mockAttackSurfaces);

    // Render the component
    renderWithProviders(<ProjectPage />);

    // Wait for the project details to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Find and click the first Back button
    const backButtons = screen.getAllByText('Back to Dashboard');
    fireEvent.click(backButtons[0]);

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('renders empty state when no attack surfaces are found', async () => {
    // Setup - mock successful project response but empty attack surfaces
    (projectsApi.getProject as jest.Mock).mockResolvedValue(mockProject);
    (projectsApi.getAttackSurfaces as jest.Mock).mockResolvedValue([]);

    // Render the component
    renderWithProviders(<ProjectPage />);

    // Wait for the project details to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Verify empty state message is displayed
    expect(screen.getByText('No attack surfaces found for this project.')).toBeInTheDocument();
  });

  it('navigates to create attack surface page when Create Attack Surface button is clicked', async () => {
    // Setup - mock successful responses
    (projectsApi.getProject as jest.Mock).mockResolvedValue(mockProject);
    (projectsApi.getAttackSurfaces as jest.Mock).mockResolvedValue(mockAttackSurfaces);

    // Render the component
    renderWithProviders(<ProjectPage />);

    // Wait for the project details to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Find and click the Create Attack Surface button
    const createButton = screen.getByText('Create Attack Surface');
    fireEvent.click(createButton);

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1/attack-surfaces/new');
  });
});

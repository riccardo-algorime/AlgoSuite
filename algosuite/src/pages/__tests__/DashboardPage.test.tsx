import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { DashboardPage } from '../DashboardPage';
import { projectsApi } from '../../api/projectsApi';
import { Project } from '../../types';

// Mock toaster from components/ui/toaster
const mockToaster = {
  error: jest.fn(),
  success: jest.fn(),
  create: jest.fn(),
};
jest.mock('../../components/ui/toaster', () => ({
  toaster: mockToaster,
}));

// Mock the projectsApi
jest.mock('../../api/projectsApi', () => ({
  projectsApi: {
    getProjects: jest.fn(),
  },
}));

// Mock the react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock projects data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Test Project 1',
    description: 'This is test project 1',
    created_by: 'user-123',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-02T12:00:00Z',
  },
  {
    id: '2',
    name: 'Test Project 2',
    description: 'This is test project 2',
    created_by: 'user-123',
    created_at: '2023-01-03T12:00:00Z',
    updated_at: '2023-01-04T12:00:00Z',
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Setup - mock loading state
    (projectsApi.getProjects as jest.Mock).mockImplementation(() => new Promise(() => {}));

    // Render the component
    renderWithProviders(<DashboardPage />);

    // Verify loading state is shown
    expect(screen.getByText('My Projects')).toBeInTheDocument();
    // Check for the spinner using the data-testid
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders projects when data is loaded', async () => {
    // Setup - mock successful response
    (projectsApi.getProjects as jest.Mock).mockResolvedValue(mockProjects);

    // Render the component
    renderWithProviders(<DashboardPage />);

    // Wait for the projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Verify both projects are rendered
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    expect(screen.getByText('This is test project 1')).toBeInTheDocument();
    expect(screen.getByText('This is test project 2')).toBeInTheDocument();
  });

  it('renders empty state when no projects are found', async () => {
    // Setup - mock empty response
    (projectsApi.getProjects as jest.Mock).mockResolvedValue([]);

    // Render the component
    renderWithProviders(<DashboardPage />);

    // Wait for the empty state to be rendered
    await waitFor(() => {
      expect(screen.getByText('No projects found')).toBeInTheDocument();
    });

    // Verify empty state content
    expect(screen.getByText('Get started by creating your first project')).toBeInTheDocument();
    expect(screen.getAllByText('Create New Project')).toHaveLength(2); // One in header, one in empty state
  });

  it('renders error state when API call fails', async () => {
    // Setup - mock error response
    const error = new Error('Failed to fetch projects');
    (projectsApi.getProjects as jest.Mock).mockRejectedValue(error);

    // Render the component
    renderWithProviders(<DashboardPage />);

    // Wait for the error state to be rendered
    await waitFor(() => {
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    });

    // Verify error state content
    expect(screen.getByText('Please try refreshing the page or contact support if the problem persists.')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('navigates to project details when View button is clicked', async () => {
    // Setup - mock successful response
    (projectsApi.getProjects as jest.Mock).mockResolvedValue(mockProjects);

    // Render the component
    renderWithProviders(<DashboardPage />);

    // Wait for the projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Find and click the View button for the first project
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Verify navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });

  it('navigates to project edit when Edit button is clicked', async () => {
    // Setup - mock successful response
    (projectsApi.getProjects as jest.Mock).mockResolvedValue(mockProjects);

    // Render the component
    renderWithProviders(<DashboardPage />);

    // Wait for the projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Find and click the Edit button for the first project
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Verify navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1/edit');
  });

  it('navigates to create project page when Create New Project button is clicked', async () => {
    // Setup - mock successful response
    (projectsApi.getProjects as jest.Mock).mockResolvedValue(mockProjects);

    // Render the component
    renderWithProviders(<DashboardPage />);

    // Wait for the projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Find and click the Create New Project button
    const createButton = screen.getByText('Create New Project');
    fireEvent.click(createButton);

    // Verify navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/projects/new');
  });
});

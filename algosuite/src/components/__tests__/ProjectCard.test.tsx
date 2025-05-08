import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { ProjectCard } from '../ProjectCard';
import { Project } from '../../types';

// Mock project data
const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'This is a test project description',
  created_by: 'user-123',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-02T12:00:00Z',
};

// Mock callback functions
const mockOnView = jest.fn();
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

describe('ProjectCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project information correctly', () => {
    renderWithProviders(<ProjectCard project={mockProject} />);

    // Check if project name is displayed
    expect(screen.getByText('Test Project')).toBeInTheDocument();

    // Check if project description is displayed
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();

    // Check if dates are displayed (partial match since formatting might change)
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('renders in compact mode correctly', () => {
    renderWithProviders(<ProjectCard project={mockProject} isCompact={true} />);

    // Check if project name is displayed
    expect(screen.getByText('Test Project')).toBeInTheDocument();

    // Check if project description is displayed
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();

    // In compact mode, dates should not be displayed
    expect(screen.queryByText(/Created:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument();
  });

  it('calls onView callback when View button is clicked', () => {
    renderWithProviders(<ProjectCard project={mockProject} onView={mockOnView} />);

    // Find and click the View button
    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    // Check if the callback was called with the project
    expect(mockOnView).toHaveBeenCalledWith(mockProject);
  });

  it('calls onEdit callback when Edit button is clicked', () => {
    renderWithProviders(<ProjectCard project={mockProject} onEdit={mockOnEdit} />);

    // Find and click the Edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Check if the callback was called with the project
    expect(mockOnEdit).toHaveBeenCalledWith(mockProject);
  });

  it('calls onDelete callback when Delete button is clicked', () => {
    renderWithProviders(<ProjectCard project={mockProject} onDelete={mockOnDelete} />);

    // Find and click the Delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Check if the callback was called with the project
    expect(mockOnDelete).toHaveBeenCalledWith(mockProject);
  });

  it('does not render action buttons when callbacks are not provided', () => {
    renderWithProviders(<ProjectCard project={mockProject} />);

    // Check that action buttons are not rendered
    expect(screen.queryByText('View')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});

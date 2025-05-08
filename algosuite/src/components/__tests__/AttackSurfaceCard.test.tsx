import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { AttackSurfaceCard } from '../AttackSurfaceCard';
import { AttackSurface, SurfaceType } from '../../types';

// Mock attack surface data
const mockAttackSurface: AttackSurface = {
  id: '1',
  project_id: 'project-123',
  surface_type: SurfaceType.WEB,
  description: 'This is a web attack surface description',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-02T12:00:00Z',
};

// Mock callback functions
const mockOnView = jest.fn();
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

describe('AttackSurfaceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders attack surface information correctly', () => {
    renderWithProviders(<AttackSurfaceCard attackSurface={mockAttackSurface} />);

    // Check if surface type is displayed
    expect(screen.getByText(/Web Surface/)).toBeInTheDocument();

    // Check if surface description is displayed
    expect(screen.getByText('This is a web attack surface description')).toBeInTheDocument();

    // Check if badge is displayed
    expect(screen.getByText('Web')).toBeInTheDocument();

    // Check if dates are displayed (partial match since formatting might change)
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('renders in compact mode correctly', () => {
    renderWithProviders(<AttackSurfaceCard attackSurface={mockAttackSurface} isCompact={true} />);

    // Check if surface type is displayed
    expect(screen.getByText(/Web Surface/)).toBeInTheDocument();

    // Check if surface description is displayed
    expect(screen.getByText('This is a web attack surface description')).toBeInTheDocument();

    // In compact mode, dates should not be displayed
    expect(screen.queryByText(/Created:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument();
  });

  it('calls onView callback when View button is clicked', () => {
    renderWithProviders(<AttackSurfaceCard attackSurface={mockAttackSurface} onView={mockOnView} />);

    // Find and click the View button
    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    // Check if the callback was called with the attack surface
    expect(mockOnView).toHaveBeenCalledWith(mockAttackSurface);
  });

  it('calls onEdit callback when Edit button is clicked', () => {
    renderWithProviders(<AttackSurfaceCard attackSurface={mockAttackSurface} onEdit={mockOnEdit} />);

    // Find and click the Edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Check if the callback was called with the attack surface
    expect(mockOnEdit).toHaveBeenCalledWith(mockAttackSurface);
  });

  it('calls onDelete callback when Delete button is clicked', () => {
    renderWithProviders(<AttackSurfaceCard attackSurface={mockAttackSurface} onDelete={mockOnDelete} />);

    // Find and click the Delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Check if the callback was called with the attack surface
    expect(mockOnDelete).toHaveBeenCalledWith(mockAttackSurface);
  });

  it('does not render action buttons when callbacks are not provided', () => {
    renderWithProviders(<AttackSurfaceCard attackSurface={mockAttackSurface} />);

    // Check that action buttons are not rendered
    expect(screen.queryByText('View')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders different surface types with appropriate styling', () => {
    // Test with a different surface type
    const networkSurface: AttackSurface = {
      ...mockAttackSurface,
      surface_type: SurfaceType.NETWORK,
    };

    renderWithProviders(<AttackSurfaceCard attackSurface={networkSurface} />);

    // Check if the correct surface type is displayed
    expect(screen.getByText(/Network Surface/)).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
  });
});

import { waitFor } from '@testing-library/react';
import { projectsApi } from '../../api/projectsApi';
import { useProjects, useProject } from '../../hooks/useProjects';
import { renderHookWithClient } from '../utils/test-utils';

// Mock the projectsApi
jest.mock('../../api/projectsApi', () => ({
  projectsApi: {
    getProjects: jest.fn(),
    getProject: jest.fn(),
  },
}));

describe('useProjects hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getProjects with correct parameters', async () => {
    // Setup
    const mockProjects = [
      { id: '1', name: 'Test Project 1', description: 'Description 1', created_by: 'user1', created_at: '2023-01-01', updated_at: '2023-01-01' },
      { id: '2', name: 'Test Project 2', description: 'Description 2', created_by: 'user1', created_at: '2023-01-02', updated_at: '2023-01-02' },
    ];
    (projectsApi.getProjects as jest.Mock).mockResolvedValue(mockProjects);

    // Execute
    const { result } = renderHookWithClient(() => useProjects());

    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify
    expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    expect(projectsApi.getProjects).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(mockProjects);
  });

  it('should call getProjects with pagination parameters', async () => {
    // Setup
    const mockProjects = [{ id: '1', name: 'Test Project 1' }];
    (projectsApi.getProjects as jest.Mock).mockResolvedValue(mockProjects);
    const params = { page: 1, limit: 10 };

    // Execute
    const { result } = renderHookWithClient(() => useProjects(params));

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify
    expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    expect(projectsApi.getProjects).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockProjects);
  });

  it('should handle error state', async () => {
    // Setup
    const error = new Error('Failed to fetch projects');
    (projectsApi.getProjects as jest.Mock).mockRejectedValue(error);

    // Execute
    const { result } = renderHookWithClient(() => useProjects());

    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify
    expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    expect(result.current.error).toEqual(error);
  });
});

describe('useProject hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getProject with correct ID', async () => {
    // Setup
    const projectId = '1';
    const mockProject = { 
      id: projectId, 
      name: 'Test Project', 
      description: 'Description', 
      created_by: 'user1', 
      created_at: '2023-01-01', 
      updated_at: '2023-01-01' 
    };
    (projectsApi.getProject as jest.Mock).mockResolvedValue(mockProject);

    // Execute
    const { result } = renderHookWithClient(() => useProject(projectId));

    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify
    expect(projectsApi.getProject).toHaveBeenCalledTimes(1);
    expect(projectsApi.getProject).toHaveBeenCalledWith(projectId);
    expect(result.current.data).toEqual(mockProject);
  });

  it('should not fetch when ID is not provided', async () => {
    // Execute
    const { result } = renderHookWithClient(() => useProject(''));

    // Verify
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(projectsApi.getProject).not.toHaveBeenCalled();
  });

  it('should handle error state', async () => {
    // Setup
    const projectId = '1';
    const error = new Error('Failed to fetch project');
    (projectsApi.getProject as jest.Mock).mockRejectedValue(error);

    // Execute
    const { result } = renderHookWithClient(() => useProject(projectId));

    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify
    expect(projectsApi.getProject).toHaveBeenCalledTimes(1);
    expect(result.current.error).toEqual(error);
  });
});

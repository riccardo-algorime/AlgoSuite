import { waitFor } from '@testing-library/react';
import { projectsApi } from '../../api/projectsApi';
import { useProjectAttackSurfaces, useAttackSurface } from '../../hooks/useAttackSurfaces';
import { renderHookWithClient } from '../utils/test-utils';
import { SurfaceType } from '../../types';

// Mock the projectsApi
jest.mock('../../api/projectsApi', () => ({
  projectsApi: {
    getAttackSurfaces: jest.fn(),
    getAttackSurface: jest.fn(),
  },
}));

describe('useProjectAttackSurfaces hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAttackSurfaces with correct parameters', async () => {
    // Setup
    const projectId = '1';
    const mockSurfaces = [
      { 
        id: '1', 
        project_id: projectId, 
        surface_type: SurfaceType.WEB, 
        description: 'Web Surface', 
        created_at: '2023-01-01', 
        updated_at: '2023-01-01' 
      },
      { 
        id: '2', 
        project_id: projectId, 
        surface_type: SurfaceType.API, 
        description: 'API Surface', 
        created_at: '2023-01-02', 
        updated_at: '2023-01-02' 
      },
    ];
    (projectsApi.getAttackSurfaces as jest.Mock).mockResolvedValue(mockSurfaces);

    // Execute
    const { result } = renderHookWithClient(() => useProjectAttackSurfaces(projectId));

    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify
    expect(projectsApi.getAttackSurfaces).toHaveBeenCalledTimes(1);
    expect(projectsApi.getAttackSurfaces).toHaveBeenCalledWith(projectId, undefined);
    expect(result.current.data).toEqual(mockSurfaces);
  });

  it('should call getAttackSurfaces with pagination parameters', async () => {
    // Setup
    const projectId = '1';
    const mockSurfaces = [{ id: '1', project_id: projectId, surface_type: SurfaceType.WEB }];
    (projectsApi.getAttackSurfaces as jest.Mock).mockResolvedValue(mockSurfaces);
    const params = { page: 1, limit: 10 };

    // Execute
    const { result } = renderHookWithClient(() => useProjectAttackSurfaces(projectId, params));

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify
    expect(projectsApi.getAttackSurfaces).toHaveBeenCalledTimes(1);
    expect(projectsApi.getAttackSurfaces).toHaveBeenCalledWith(projectId, params);
    expect(result.current.data).toEqual(mockSurfaces);
  });

  it('should not fetch when projectId is not provided', async () => {
    // Execute
    const { result } = renderHookWithClient(() => useProjectAttackSurfaces(''));

    // Verify
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(projectsApi.getAttackSurfaces).not.toHaveBeenCalled();
  });

  it('should handle error state', async () => {
    // Setup
    const projectId = '1';
    const error = new Error('Failed to fetch attack surfaces');
    (projectsApi.getAttackSurfaces as jest.Mock).mockRejectedValue(error);

    // Execute
    const { result } = renderHookWithClient(() => useProjectAttackSurfaces(projectId));

    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify
    expect(projectsApi.getAttackSurfaces).toHaveBeenCalledTimes(1);
    expect(result.current.error).toEqual(error);
  });
});

describe('useAttackSurface hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAttackSurface with correct parameters', async () => {
    // Setup
    const projectId = '1';
    const surfaceId = '2';
    const mockSurface = { 
      id: surfaceId, 
      project_id: projectId, 
      surface_type: SurfaceType.WEB, 
      description: 'Web Surface', 
      created_at: '2023-01-01', 
      updated_at: '2023-01-01' 
    };
    (projectsApi.getAttackSurface as jest.Mock).mockResolvedValue(mockSurface);

    // Execute
    const { result } = renderHookWithClient(() => useAttackSurface(projectId, surfaceId));

    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify
    expect(projectsApi.getAttackSurface).toHaveBeenCalledTimes(1);
    expect(projectsApi.getAttackSurface).toHaveBeenCalledWith(projectId, surfaceId);
    expect(result.current.data).toEqual(mockSurface);
  });

  it('should not fetch when projectId is not provided', async () => {
    // Execute
    const { result } = renderHookWithClient(() => useAttackSurface('', '2'));

    // Verify
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(projectsApi.getAttackSurface).not.toHaveBeenCalled();
  });

  it('should not fetch when surfaceId is not provided', async () => {
    // Execute
    const { result } = renderHookWithClient(() => useAttackSurface('1', ''));

    // Verify
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(projectsApi.getAttackSurface).not.toHaveBeenCalled();
  });

  it('should handle error state', async () => {
    // Setup
    const projectId = '1';
    const surfaceId = '2';
    const error = new Error('Failed to fetch attack surface');
    (projectsApi.getAttackSurface as jest.Mock).mockRejectedValue(error);

    // Execute
    const { result } = renderHookWithClient(() => useAttackSurface(projectId, surfaceId));

    // Wait for the query to fail
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify
    expect(projectsApi.getAttackSurface).toHaveBeenCalledTimes(1);
    expect(result.current.error).toEqual(error);
  });
});

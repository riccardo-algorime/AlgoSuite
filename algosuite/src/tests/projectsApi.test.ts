import { projectsApi } from '../api/projectsApi';
import { api } from '../api/apiClient';

// Mock the base API client
jest.mock('../api/apiClient', () => ({
  api: {
    get: jest.fn(),
    setAuthHeader: jest.fn(),
    removeAuthHeader: jest.fn(),
  },
}));

describe('Projects API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getProjects with correct endpoint', async () => {
    // Setup
    const mockProjects = [{ id: '1', name: 'Test Project' }];
    (api.get as jest.Mock).mockResolvedValue(mockProjects);
    const params = { page: 1, limit: 10 };

    // Execute
    const result = await projectsApi.getProjects(params);

    // Verify
    expect(api.get).toHaveBeenCalledWith('/v1/projects', { params: params });
    expect(result).toEqual(mockProjects);
  });

  it('should call getProject with correct endpoint and ID', async () => {
    // Setup
    const mockProject = { id: '1', name: 'Test Project' };
    (api.get as jest.Mock).mockResolvedValue(mockProject);
    const projectId = '1';

    // Execute
    const result = await projectsApi.getProject(projectId);

    // Verify
    expect(api.get).toHaveBeenCalledWith('/v1/projects/1');
    expect(result).toEqual(mockProject);
  });

  it('should call getAttackSurfaces with correct endpoint and project ID', async () => {
    // Setup
    const mockSurfaces = [{ id: '1', project_id: '1', surface_type: 'web' }];
    (api.get as jest.Mock).mockResolvedValue(mockSurfaces);
    const projectId = '1';
    const params = { page: 1, limit: 10 };

    // Execute
    const result = await projectsApi.getAttackSurfaces(projectId, params);

    // Verify
    expect(api.get).toHaveBeenCalledWith('/v1/projects/1/attack-surfaces', { params: params });
    expect(result).toEqual(mockSurfaces);
  });

  it('should call getAttackSurface with correct endpoint, project ID, and surface ID', async () => {
    // Setup
    const mockSurface = { id: '1', project_id: '1', surface_type: 'web' };
    (api.get as jest.Mock).mockResolvedValue(mockSurface);
    const projectId = '1';
    const surfaceId = '1';

    // Execute
    const result = await projectsApi.getAttackSurface(projectId, surfaceId);

    // Verify
    expect(api.get).toHaveBeenCalledWith('/v1/projects/1/attack-surfaces/1');
    expect(result).toEqual(mockSurface);
  });
});

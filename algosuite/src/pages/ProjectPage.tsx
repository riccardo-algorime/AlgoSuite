import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { Table } from '@chakra-ui/react';
import { toaster } from '../components/ui/toaster';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useProjectAttackSurfaces } from '../hooks/useAttackSurfaces';
import { AttackSurface, SurfaceType } from '../types';
import { formatDate } from '../utils/formatters';

// Color scheme for different surface types
const getSurfaceTypeColorScheme = (type: SurfaceType): string => {
  switch (type) {
    case SurfaceType.WEB:
      return 'blue';
    case SurfaceType.API:
      return 'green';
    case SurfaceType.MOBILE:
      return 'purple';
    case SurfaceType.NETWORK:
      return 'orange';
    case SurfaceType.CLOUD:
      return 'cyan';
    case SurfaceType.IOT:
      return 'pink';
    case SurfaceType.OTHER:
    default:
      return 'gray';
  }
};

// Format surface type for display
const formatSurfaceType = (type: SurfaceType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const ProjectPage = () => {
  // Get project ID from URL parameters
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Fetch project details
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isErrorProject,
    error: projectError,
  } = useProject(projectId || '');

  // Fetch attack surfaces for this project
  const {
    data: attackSurfaces,
    isLoading: isLoadingAttackSurfaces,
    isError: isErrorSurfaces,
    error: surfacesError,
  } = useProjectAttackSurfaces(projectId || '');

  // Handle navigation to attack surface page
  const handleViewAttackSurface = (attackSurface: AttackSurface) => {
    navigate(`/projects/${projectId}/attack-surfaces/${attackSurface.id}`);
  };

  // Handle navigation to edit attack surface
  const handleEditAttackSurface = (attackSurface: AttackSurface) => {
    navigate(`/projects/${projectId}/attack-surfaces/${attackSurface.id}/edit`);
  };

  // Handle navigation to create new attack surface
  const handleCreateAttackSurface = () => {
    navigate(`/projects/${projectId}/attack-surfaces/new`);
  };

  // Handle back to dashboard navigation
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Show error toast if project fetch fails
  if (isErrorProject && projectError) {
    toaster.error('Error loading project', {
      description: (projectError as Error).message || 'Failed to load project details',
    });
  }

  // Show error toast if attack surfaces fetch fails
  if (isErrorSurfaces && surfacesError) {
    toaster.error('Error loading attack surfaces', {
      description: (surfacesError as Error).message || 'Failed to load attack surfaces',
    });
  }

  // Loading state
  if (isLoadingProject) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="50vh">
          <Spinner size="xl" color="blue.500" role="status" />
        </Flex>
      </Container>
    );
  }

  // Error state - if we couldn't load the project
  if (isErrorProject || !project) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack>
          <Box>
            <Button onClick={handleBackToDashboard} variant="outline" mb={4}>
              Back to Dashboard
            </Button>
          </Box>
          <Heading as="h1" size="lg">
            Project Not Found
          </Heading>
          <Text>The project you're looking for could not be found or you don't have access to it.</Text>
          <Button onClick={handleBackToDashboard} colorScheme="blue" mt={4}>
            Return to Dashboard
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch" width="100%">
        {/* Navigation */}
        <Box>
          <Button onClick={handleBackToDashboard} variant="outline" mb={4}>
            Back to Dashboard
          </Button>
        </Box>

        {/* Project Header */}
        <Box width="100%">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h1" size="xl">
              {project?.name || 'Untitled Project'}
            </Heading>
          </Flex>
          {project?.description && (
            <Text fontSize="lg" mb={4}>
              {project.description}
            </Text>
          )}
          <Box fontSize="sm" color="text.secondary" mb={6}>
            <Text>Created: {formatDate(project?.created_at)}</Text>
            <Text>Last updated: {formatDate(project?.updated_at)}</Text>
          </Box>
        </Box>

        {/* Attack Surfaces Section */}
        <Box width="100%">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h2" size="lg">
              Attack Surfaces
            </Heading>
            <Button
              colorScheme="blue"
              onClick={handleCreateAttackSurface}
              data-testid="create-attack-surface-button"
            >
              Create Attack Surface
            </Button>
          </Flex>

          {isLoadingAttackSurfaces ? (
            <Flex justify="center" py={8}>
              <Spinner size="md" color="blue.500" />
            </Flex>
          ) : attackSurfaces && attackSurfaces.length > 0 ? (
            <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
              <Table.Root variant="outline" size="md" interactive>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                    <Table.ColumnHeader>Created</Table.ColumnHeader>
                    <Table.ColumnHeader>Updated</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {attackSurfaces.map((surface: AttackSurface) => {
                    // Get color scheme and formatted type
                    const colorScheme = getSurfaceTypeColorScheme(surface.surface_type);
                    const formattedType = formatSurfaceType(surface.surface_type);

                    return (
                      <Table.Row key={surface.id}>
                        <Table.Cell>
                          <Badge colorScheme={colorScheme} fontSize="0.8em">
                            {formattedType}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{surface.description || '-'}</Table.Cell>
                        <Table.Cell>{formatDate(surface.created_at)}</Table.Cell>
                        <Table.Cell>{formatDate(surface.updated_at)}</Table.Cell>
                        <Table.Cell textAlign="right">
                          <Button size="sm" variant="ghost" onClick={() => handleViewAttackSurface(surface)} mr={2}>
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditAttackSurface(surface)}>
                            Edit
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Box>
          ) : (
            <Box p={6} borderWidth="1px" borderRadius="lg" bg="background.card">
              <Text textAlign="center">No attack surfaces found for this project.</Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

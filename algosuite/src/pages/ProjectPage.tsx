import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { toaster } from '../components/ui/toaster';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useProjectAttackSurfaces } from '../hooks/useAttackSurfaces';
import { AttackSurfaceCard } from '../components/AttackSurfaceCard';
import { AttackSurface } from '../types';
import { formatDate } from '../utils/formatters';

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
          <Heading as="h2" size="lg" mb={4}>
            Attack Surfaces
          </Heading>

          {isLoadingAttackSurfaces ? (
            <Flex justify="center" py={8}>
              <Spinner size="md" color="blue.500" />
            </Flex>
          ) : attackSurfaces && attackSurfaces.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {attackSurfaces.map((surface: AttackSurface) => (
                <AttackSurfaceCard
                  key={surface.id}
                  attackSurface={surface}
                  onView={handleViewAttackSurface}
                  onEdit={handleEditAttackSurface}
                />
              ))}
            </SimpleGrid>
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

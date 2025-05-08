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
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { Project } from '../types';

export const DashboardPage = () => {
  const { data: projects, isLoading, isError } = useProjects();
  const navigate = useNavigate();

  // Handle view project action
  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  // Handle edit project action
  const handleEditProject = (project: Project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              My Projects
            </Heading>
            <Text color="text.secondary">
              Manage and monitor your security projects
            </Text>
          </Box>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/projects/new')}
          >
            Create New Project
          </Button>
        </Flex>

        {/* Loading state */}
        {isLoading && (
          <Flex justify="center" align="center" minH="200px">
            <Spinner
              size="xl"
              color="blue.500"
              data-testid="loading-spinner"
            />
          </Flex>
        )}

        {/* Error state - we already show a toast, but we could add an inline message here too */}
        {isError && !isLoading && (
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            borderColor="red.300"
            bg="red.50"
            color="red.800"
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={2}>
              Failed to load projects
            </Heading>
            <Text>
              Please try refreshing the page or contact support if the problem persists.
            </Text>
            <Button
              mt={4}
              colorScheme="red"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Box>
        )}

        {/* Empty state */}
        {!isLoading && !isError && projects && projects.length === 0 && (
          <Box
            p={8}
            borderWidth="1px"
            borderRadius="lg"
            borderColor="gray.200"
            bg="background.card"
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={4}>
              No projects found
            </Heading>
            <Text mb={6}>
              Get started by creating your first project
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => navigate('/projects/new')}
            >
              Create New Project
            </Button>
          </Box>
        )}

        {/* Projects grid */}
        {!isLoading && !isError && projects && projects.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

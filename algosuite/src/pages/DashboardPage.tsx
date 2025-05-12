import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Table } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../types';
import { formatDate } from '../utils/formatters';

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

        {/* Projects table */}
        {!isLoading && !isError && projects && projects.length > 0 && (
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table.Root variant="outline" size="md" interactive>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Description</Table.ColumnHeader>
                  <Table.ColumnHeader>Created</Table.ColumnHeader>
                  <Table.ColumnHeader>Updated</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {projects.map((project) => (
                  <Table.Row key={project.id}>
                    <Table.Cell fontWeight="medium">{project.name}</Table.Cell>
                    <Table.Cell>{project.description || '-'}</Table.Cell>
                    <Table.Cell>{formatDate(project.created_at)}</Table.Cell>
                    <Table.Cell>{formatDate(project.updated_at)}</Table.Cell>
                    <Table.Cell textAlign="right">
                      <Button size="sm" variant="ghost" onClick={() => handleViewProject(project)} mr={2}>
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditProject(project)}>
                        Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

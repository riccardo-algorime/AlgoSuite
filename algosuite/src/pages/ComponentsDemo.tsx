import { Box, Container, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { ProjectCard } from '../components/ProjectCard';
import { AttackSurfaceCard } from '../components/AttackSurfaceCard';
import { Project, AttackSurface, SurfaceType } from '../types';

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Security Audit',
    description: 'Comprehensive security audit for an e-commerce platform, focusing on payment processing and user data protection.',
    created_by: 'user-123',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'Healthcare App Assessment',
    description: 'Security assessment for a healthcare mobile application that handles sensitive patient data.',
    created_by: 'user-123',
    created_at: '2023-02-10T09:15:00Z',
    updated_at: '2023-02-20T16:45:00Z',
  },
];

const mockAttackSurfaces: AttackSurface[] = [
  {
    id: '1',
    project_id: '1',
    surface_type: SurfaceType.WEB,
    description: 'Customer-facing web application with user authentication and payment processing.',
    created_at: '2023-01-02T10:00:00Z',
    updated_at: '2023-01-02T10:00:00Z',
  },
  {
    id: '2',
    project_id: '1',
    surface_type: SurfaceType.API,
    description: 'RESTful API that handles product data, user accounts, and order processing.',
    created_at: '2023-01-03T11:30:00Z',
    updated_at: '2023-01-03T11:30:00Z',
  },
  {
    id: '3',
    project_id: '2',
    surface_type: SurfaceType.MOBILE,
    description: 'iOS and Android mobile applications for patients to access their medical records.',
    created_at: '2023-02-11T14:20:00Z',
    updated_at: '2023-02-11T14:20:00Z',
  },
  {
    id: '4',
    project_id: '2',
    surface_type: SurfaceType.CLOUD,
    description: 'AWS-hosted backend services for data storage and processing.',
    created_at: '2023-02-12T09:45:00Z',
    updated_at: '2023-02-12T09:45:00Z',
  },
];

// Mock handlers
const handleViewProject = (project: Project) => {
  console.log('View project:', project);
};

const handleEditProject = (project: Project) => {
  console.log('Edit project:', project);
};

const handleViewAttackSurface = (attackSurface: AttackSurface) => {
  console.log('View attack surface:', attackSurface);
};

const handleEditAttackSurface = (attackSurface: AttackSurface) => {
  console.log('Edit attack surface:', attackSurface);
};

export const ComponentsDemo = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={12} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={6}>
            Components Demo
          </Heading>
          <Text fontSize="lg" mb={8}>
            This page demonstrates the reusable UI components created for the AlgoSuite application.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Project Cards
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {mockProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
              />
            ))}
          </SimpleGrid>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Attack Surface Cards
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {mockAttackSurfaces.map((surface) => (
              <AttackSurfaceCard
                key={surface.id}
                attackSurface={surface}
                onView={handleViewAttackSurface}
                onEdit={handleEditAttackSurface}
              />
            ))}
          </SimpleGrid>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Compact Cards
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            <ProjectCard
              project={mockProjects[0]}
              isCompact={true}
              onView={handleViewProject}
            />
            <AttackSurfaceCard
              attackSurface={mockAttackSurfaces[0]}
              isCompact={true}
              onView={handleViewAttackSurface}
            />
            <AttackSurfaceCard
              attackSurface={mockAttackSurfaces[2]}
              isCompact={true}
              onView={handleViewAttackSurface}
            />
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
};

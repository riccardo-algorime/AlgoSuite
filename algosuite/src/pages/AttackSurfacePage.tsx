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
  Code,
  CodeProps,
} from '@chakra-ui/react';
import { Divider } from '../components/ui/divider';
import { toaster } from '../components/ui/toaster';
import { useNavigate, useParams } from 'react-router-dom';
import { useAttackSurface } from '../hooks/useAttackSurfaces';
import { formatDate } from '../utils/formatters';
import { getSurfaceTypeColorScheme, formatSurfaceType, getSurfaceTypeIcon } from '../utils/surfaceHelpers';

// JSON display component with syntax highlighting
const JsonDisplay = (props: CodeProps & { data: Record<string, unknown> }) => {
  const { data, ...rest } = props;
  return (
    <Code
      display="block"
      whiteSpace="pre"
      p={4}
      borderRadius="md"
      fontSize="sm"
      overflowX="auto"
      {...rest}
    >
      {JSON.stringify(data, null, 2)}
    </Code>
  );
};

export const AttackSurfacePage = () => {
  // Get project ID and surface ID from URL parameters
  const { projectId, surfaceId } = useParams<{ projectId: string; surfaceId: string }>();
  const navigate = useNavigate();

  // Fetch attack surface details
  const {
    data: attackSurface,
    isLoading,
    isError,
    error,
  } = useAttackSurface(projectId || '', surfaceId || '');

  // Handle navigation back to project page
  const handleBackToProject = () => {
    navigate(`/projects/${projectId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Flex justify="center" align="center" minH="50vh">
          <Spinner size="xl" role="status" />
        </Flex>
      </Container>
    );
  }

  // Show error state
  if (isError || !attackSurface) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load attack surface details';

    // Show error toast
    toaster.error({
      title: 'Error',
      description: errorMessage,
    });

    return (
      <Container maxW="container.lg" py={8}>
        <VStack gap={4} align="stretch">
          <Button variant="outline" onClick={handleBackToProject}>
            ← Back to Project
          </Button>
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" color="red.500" mb={4}>
              Error Loading Attack Surface
            </Heading>
            <Text>{errorMessage}</Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  // Extract attack surface details
  const { surface_type, description, created_at, updated_at, config } = attackSurface;

  // Format data for display
  const colorScheme = getSurfaceTypeColorScheme(surface_type);
  const formattedType = formatSurfaceType(surface_type);
  const formattedCreatedAt = formatDate(created_at);
  const formattedUpdatedAt = formatDate(updated_at);
  const surfaceIcon = getSurfaceTypeIcon(surface_type);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack gap={6} align="stretch">
        {/* Back button */}
        <Button
          variant="outline"
          onClick={handleBackToProject}
          alignSelf="flex-start"
        >
          ← Back to Project
        </Button>

        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading as="h1" size="xl">
            <Box as="span" mr={2}>
              {surfaceIcon}
            </Box>
            {formattedType} Attack Surface
          </Heading>
          <Badge colorScheme={colorScheme} fontSize="md" px={3} py={1}>
            {formattedType}
          </Badge>
        </Flex>

        {/* Description */}
        {description && (
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Description
            </Heading>
            <Text fontSize="lg">{description}</Text>
          </Box>
        )}

        <Divider />

        {/* Metadata */}
        <Box>
          <Heading as="h2" size="md" mb={4}>
            Details
          </Heading>
          <VStack gap={2} align="stretch">
            <Flex>
              <Text fontWeight="bold" width="150px">
                Surface ID:
              </Text>
              <Text>{surfaceId}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="bold" width="150px">
                Project ID:
              </Text>
              <Text>{projectId}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="bold" width="150px">
                Created:
              </Text>
              <Text>{formattedCreatedAt}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="bold" width="150px">
                Last Updated:
              </Text>
              <Text>{formattedUpdatedAt}</Text>
            </Flex>
          </VStack>
        </Box>

        {/* Configuration */}
        {config && (
          <Box>
            <Heading as="h2" size="md" mb={4}>
              Configuration
            </Heading>
            <JsonDisplay data={config} bg="gray.50" _dark={{ bg: 'gray.800' }} />
          </Box>
        )}
      </VStack>
    </Container>
  );
};

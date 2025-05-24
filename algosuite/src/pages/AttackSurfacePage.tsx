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
import { Table } from '@chakra-ui/react';
import { Divider } from '../components/ui/divider';
import { toaster } from '../components/ui/toaster';
import { useNavigate, useParams } from 'react-router-dom';
import { useAttackSurfaceWithAssets } from '../hooks/useAttackSurfaces';
import { formatDate } from '../utils/formatters';
import { getSurfaceTypeColorScheme, formatSurfaceType, getSurfaceTypeIcon } from '../utils/surfaceHelpers';
import { Asset } from '../types';

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

  // Fetch attack surface details with assets
  const {
    data: attackSurface,
    isLoading,
    isError,
    error,
  } = useAttackSurfaceWithAssets(projectId || '', surfaceId || '');

  // We don't need the create asset mutation here as we're just navigating to the create page

  // Handle navigation back to project page
  const handleBackToProject = () => {
    navigate(`/projects/${projectId}`);
  };

  // Handle viewing an asset
  const handleViewAsset = (asset: Asset) => {
    navigate(`/projects/${projectId}/attack-surfaces/${surfaceId}/assets/${asset.id}`);
  };

  // Handle editing an asset
  const handleEditAsset = (asset: Asset) => {
    navigate(`/projects/${projectId}/attack-surfaces/${surfaceId}/assets/${asset.id}/edit`);
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
    toaster.error('Error', {
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

  // Extract attack surface details - use both new and old property names for compatibility
  const surfaceType = attackSurface.surfaceType || attackSurface.surface_type;
  const { description, config, assets } = attackSurface;
  const createdAt = attackSurface.createdAt || attackSurface.created_at;
  const updatedAt = attackSurface.updatedAt || attackSurface.updated_at;

  // Format data for display
  const colorScheme = getSurfaceTypeColorScheme(surfaceType);
  const formattedType = formatSurfaceType(surfaceType);
  const formattedCreatedAt = formatDate(createdAt);
  const formattedUpdatedAt = formatDate(updatedAt);
  const surfaceIcon = getSurfaceTypeIcon(surfaceType);

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

        <Divider />

        {/* Assets */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h2" size="md">
              Assets
            </Heading>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => navigate(`/projects/${projectId}/attack-surfaces/${surfaceId}/assets/new`)}
            >
              Add Asset
            </Button>
          </Flex>

          {assets && assets.length > 0 ? (
            <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
              <Table.Root variant="outline" size="md" interactive>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                    <Table.ColumnHeader>Created</Table.ColumnHeader>
                    <Table.ColumnHeader>Updated</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {assets.map((asset) => {
                    // Get color scheme and formatted type for asset type
                    const assetTypeFormatted = asset.asset_type
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');

                    return (
                      <Table.Row key={asset.id}>
                        <Table.Cell fontWeight="medium">{asset.name}</Table.Cell>
                        <Table.Cell>
                          <Badge fontSize="0.8em">
                            {assetTypeFormatted}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{asset.description || '-'}</Table.Cell>
                        <Table.Cell>{formatDate(asset.created_at)}</Table.Cell>
                        <Table.Cell>{formatDate(asset.updated_at)}</Table.Cell>
                        <Table.Cell textAlign="right">
                          <Button size="sm" variant="ghost" onClick={() => handleViewAsset(asset)} mr={2}>
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditAsset(asset)}>
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
              <Text textAlign="center">No assets found for this attack surface.</Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

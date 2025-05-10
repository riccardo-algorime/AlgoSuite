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
import { useAsset } from '../hooks/useAssets';
import { formatDate } from '../utils/formatters';
import { AssetType } from '../types';

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

// Color scheme for different asset types
const getAssetTypeColorScheme = (type: AssetType): string => {
  switch (type) {
    case AssetType.SERVER:
      return 'blue';
    case AssetType.WEBSITE:
      return 'green';
    case AssetType.DATABASE:
      return 'purple';
    case AssetType.APPLICATION:
      return 'orange';
    case AssetType.ENDPOINT:
      return 'cyan';
    case AssetType.CONTAINER:
      return 'pink';
    case AssetType.NETWORK_DEVICE:
      return 'teal';
    case AssetType.CLOUD_RESOURCE:
      return 'yellow';
    case AssetType.OTHER:
    default:
      return 'gray';
  }
};

// Format asset type for display
const formatAssetType = (type: AssetType): string => {
  // Convert snake_case to Title Case
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const AssetPage = () => {
  // Get project ID, surface ID, and asset ID from URL parameters
  const { projectId, surfaceId, assetId } = useParams<{ projectId: string; surfaceId: string; assetId: string }>();
  const navigate = useNavigate();

  // Fetch asset details
  const {
    data: asset,
    isLoading,
    isError,
    error,
  } = useAsset(projectId || '', surfaceId || '', assetId || '');

  // Handle navigation back to attack surface page
  const handleBackToAttackSurface = () => {
    navigate(`/projects/${projectId}/attack-surfaces/${surfaceId}`);
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
  if (isError || !asset) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load asset details';

    // Show error toast
    toaster.error('Error', {
      description: errorMessage,
    });

    return (
      <Container maxW="container.lg" py={8}>
        <VStack gap={4} align="stretch">
          <Button variant="outline" onClick={handleBackToAttackSurface}>
            ← Back to Attack Surface
          </Button>
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" color="red.500" mb={4}>
              Error Loading Asset
            </Heading>
            <Text>{errorMessage}</Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  // Extract asset details
  const { name, asset_type, description, created_at, updated_at, asset_metadata } = asset;

  // Format data for display
  const colorScheme = getAssetTypeColorScheme(asset_type);
  const formattedType = formatAssetType(asset_type);
  const formattedCreatedAt = formatDate(created_at);
  const formattedUpdatedAt = formatDate(updated_at);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack gap={6} align="stretch">
        {/* Back button */}
        <Button
          variant="outline"
          onClick={handleBackToAttackSurface}
          alignSelf="flex-start"
        >
          ← Back to Attack Surface
        </Button>

        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading as="h1" size="xl">
            {name}
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
                Asset ID:
              </Text>
              <Text>{assetId}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="bold" width="150px">
                Asset Type:
              </Text>
              <Text>{formattedType}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="bold" width="150px">
                Attack Surface ID:
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

        {/* Asset Metadata */}
        {asset_metadata && (
          <Box>
            <Heading as="h2" size="md" mb={4}>
              Asset Metadata
            </Heading>
            <JsonDisplay data={asset_metadata} bg="gray.50" _dark={{ bg: 'gray.800' }} />
          </Box>
        )}
      </VStack>
    </Container>
  );
};

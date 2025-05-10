import { Box, Button, Heading, Text, Flex, Badge } from '@chakra-ui/react';
import { Card } from './Card';
import { Asset, AssetType } from '../types';
import { HStack } from './ui/stack';
import { formatDate } from '../utils/formatters';

// Icons for different asset types
const getAssetTypeIcon = (_type: AssetType) => {
  // This is a placeholder. In a real implementation, you would import and use actual icons
  return '🔧';
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

interface AssetCardProps {
  asset: Asset;
  onView?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
  isCompact?: boolean;
}

export const AssetCard = ({
  asset,
  onView,
  onEdit,
  onDelete,
  isCompact = false,
}: AssetCardProps) => {
  const { name, asset_type, description, created_at, updated_at } = asset;

  // Format dates for display
  const formattedCreatedAt = formatDate(created_at);
  const formattedUpdatedAt = formatDate(updated_at);

  // Get color scheme and formatted type
  const colorScheme = getAssetTypeColorScheme(asset_type);
  const formattedType = formatAssetType(asset_type);

  return (
    <Card>
      <Box>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading as="h3" size="md" color="text.primary">
            <Box as="span" mr={2}>
              {getAssetTypeIcon(asset_type)}
            </Box>
            {name}
          </Heading>
          <Badge colorScheme={colorScheme} fontSize="0.8em">
            {formattedType}
          </Badge>
        </Flex>

        {description && (
          <Text color="text.secondary" mb={isCompact ? 2 : 4} truncate={isCompact} lineClamp={isCompact ? 2 : undefined}>
            {description}
          </Text>
        )}

        {!isCompact && (
          <Box fontSize="sm" color="text.secondary" mb={4}>
            <Text>Created: {formattedCreatedAt}</Text>
            <Text>Last updated: {formattedUpdatedAt}</Text>
          </Box>
        )}

        <HStack spacing={2} justify="flex-end">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(asset)}
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(asset)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => onDelete(asset)}
            >
              Delete
            </Button>
          )}
        </HStack>
      </Box>
    </Card>
  );
};

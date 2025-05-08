import { Box, Button, Heading, Text, Flex, Badge } from '@chakra-ui/react';
import { Card } from './Card';
import { AttackSurface, SurfaceType } from '../types';
import { HStack } from './ui/stack';
import { formatDate } from '../utils/formatters';

// Icons for different surface types
const getSurfaceTypeIcon = (_type: SurfaceType) => {
  // This is a placeholder. In a real implementation, you would import and use actual icons
  return '🔍';
};

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

interface AttackSurfaceCardProps {
  attackSurface: AttackSurface;
  onView?: (attackSurface: AttackSurface) => void;
  onEdit?: (attackSurface: AttackSurface) => void;
  onDelete?: (attackSurface: AttackSurface) => void;
  isCompact?: boolean;
}

export const AttackSurfaceCard = ({
  attackSurface,
  onView,
  onEdit,
  onDelete,
  isCompact = false,
}: AttackSurfaceCardProps) => {
  const { surface_type, description, created_at, updated_at } = attackSurface;

  // Format dates for display
  const formattedCreatedAt = formatDate(created_at);
  const formattedUpdatedAt = formatDate(updated_at);

  // Get color scheme and formatted type
  const colorScheme = getSurfaceTypeColorScheme(surface_type);
  const formattedType = formatSurfaceType(surface_type);

  return (
    <Card>
      <Box>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading as="h3" size="md" color="text.primary">
            <Box as="span" mr={2}>
              {getSurfaceTypeIcon(surface_type)}
            </Box>
            {formattedType} Surface
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

        <HStack spacing={4} justify="flex-end">
          {onView && (
            <Button size="sm" variant="ghost" onClick={() => onView(attackSurface)}>
              View
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(attackSurface)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => onDelete(attackSurface)}
            >
              Delete
            </Button>
          )}
        </HStack>
      </Box>
    </Card>
  );
};

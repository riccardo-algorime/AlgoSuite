import { Box, Button, Heading, Text, Flex, Badge } from '@chakra-ui/react';
import { Card } from './Card';
import { AttackSurface, SurfaceType } from '../types';
import { HStack } from './ui/stack';
import { formatDate } from '../utils/formatters';
import { getSurfaceTypeColorScheme, formatSurfaceType, getSurfaceTypeIcon } from '../utils/surfaceHelpers';



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
  // Use both new and old property names for compatibility
  const surfaceType = attackSurface.surfaceType || attackSurface.surface_type;
  const { description } = attackSurface;
  const createdAt = attackSurface.createdAt || attackSurface.created_at;
  const updatedAt = attackSurface.updatedAt || attackSurface.updated_at;

  // Format dates for display
  const formattedCreatedAt = formatDate(createdAt);
  const formattedUpdatedAt = formatDate(updatedAt);

  // Get color scheme and formatted type
  const colorScheme = getSurfaceTypeColorScheme(surfaceType);
  const formattedType = formatSurfaceType(surfaceType);

  return (
    <Card>
      <Box>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading as="h3" size="md" color="text.primary">
            <Box as="span" mr={2}>
              {getSurfaceTypeIcon(surfaceType)}
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

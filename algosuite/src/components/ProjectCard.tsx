import { Box, Button, Heading, Text, Flex, Badge } from '@chakra-ui/react';
import { Card } from './Card';
import { Project } from '../types';
import { HStack } from './ui/stack';
import { formatDate } from '../utils/formatters';

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  isCompact?: boolean;
}

export const ProjectCard = ({
  project,
  onView,
  onEdit,
  onDelete,
  isCompact = false,
}: ProjectCardProps) => {
  const { name, description, created_at, updated_at } = project;

  // Format dates for display
  const formattedCreatedAt = formatDate(created_at);
  const formattedUpdatedAt = formatDate(updated_at);

  return (
    <Card>
      <Box>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading as="h3" size="md" color="text.primary">
            {name}
          </Heading>
          <Badge colorScheme="blue" fontSize="0.8em">
            Project
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
            <Button size="sm" variant="ghost" onClick={() => onView(project)}>
              View
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(project)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => onDelete(project)}
            >
              Delete
            </Button>
          )}
        </HStack>
      </Box>
    </Card>
  );
};

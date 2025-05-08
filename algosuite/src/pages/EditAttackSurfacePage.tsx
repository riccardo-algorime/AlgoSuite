import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';

export const EditAttackSurfacePage = () => {
  const { projectId, surfaceId } = useParams<{ projectId: string; surfaceId: string }>();
  const navigate = useNavigate();

  const handleBackToAttackSurface = () => {
    navigate(`/projects/${projectId}/attack-surfaces/${surfaceId}`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Button onClick={handleBackToAttackSurface} variant="outline" mb={4}>
            Back to Attack Surface
          </Button>
        </Box>
        <Heading as="h1" size="xl">
          Edit Attack Surface
        </Heading>
        <Text>
          This page will contain a form to edit attack surface with ID: {surfaceId} for project with ID: {projectId}. It is a placeholder for now.
        </Text>
      </VStack>
    </Container>
  );
};

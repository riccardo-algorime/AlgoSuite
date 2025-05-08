import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';

export const EditProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const handleBackToProject = () => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Button onClick={handleBackToProject} variant="outline" mb={4}>
            Back to Project
          </Button>
        </Box>
        <Heading as="h1" size="xl">
          Edit Project
        </Heading>
        <Text>
          This page will contain a form to edit project with ID: {projectId}. It is a placeholder for now.
        </Text>
      </VStack>
    </Container>
  );
};

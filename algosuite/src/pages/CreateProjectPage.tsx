import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const CreateProjectPage = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Button onClick={handleBackToDashboard} variant="outline" mb={4}>
            Back to Dashboard
          </Button>
        </Box>
        <Heading as="h1" size="xl">
          Create New Project
        </Heading>
        <Text>
          This page will contain a form to create a new project. It is a placeholder for now.
        </Text>
      </VStack>
    </Container>
  );
};

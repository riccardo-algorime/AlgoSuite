import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Center,
  Heading,
  Link,
  Text,
  VStack
} from '@chakra-ui/react'

export const NotFoundPage = () => {
  return (
    <Center minH="60vh">
      <VStack spacing={6} textAlign="center" p={8}>
        <Heading as="h1" size="4xl" color="text.primary">
          404
        </Heading>
        <Heading as="h2" size="xl" mb={2}>
          Page Not Found
        </Heading>
        <Text fontSize="lg" maxW="28rem" mb={6} color="text.secondary">
          The page you are looking for doesn't exist or has been moved.
        </Text>
        <Button
          as={RouterLink}
          to="/"
          variant="primary"
          size="lg"
        >
          Go Home
        </Button>
      </VStack>
    </Center>
  )
}

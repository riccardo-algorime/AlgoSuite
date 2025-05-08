
import {
  Button,
  Center,
  Heading,
  Text,
  VStack
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const NotFoundPage = () => {
  const navigate = useNavigate()
  const { authState } = useAuth()

  const handleNavigation = () => {
    // Navigate to dashboard if authenticated, otherwise to home
    navigate(authState.isAuthenticated ? '/dashboard' : '/')
  }

  return (
    <Center minH="60vh">
      <VStack gap={6} textAlign="center" p={8}>
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
          variant="solid"
          size="lg"
          onClick={handleNavigation}
        >
          {authState.isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
        </Button>
      </VStack>
    </Center>
  )
}

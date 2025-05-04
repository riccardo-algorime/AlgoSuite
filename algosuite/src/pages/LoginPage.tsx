import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
  Alert,
  AlertIcon,
  FormErrorMessage
} from '@chakra-ui/react';
import { Card } from '../components/Card';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = (location.state as { from?: string })?.from || '/';

  // Check for success message from registration
  useEffect(() => {
    const message = (location.state as { message?: string })?.message;
    if (message) {
      setSuccessMessage(message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(username, password);
      // Redirect to the page the user was trying to access
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center minH="80vh" py={12}>
      <Container maxW="md" p={0}>
        <Card p={8}>
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Login to AlgoSuite
            </Heading>

            {error && (
              <Alert status="error" borderRadius="md" bg="red.800" color="white">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert status="success" borderRadius="md" bg="green.800" color="white">
                <AlertIcon />
                {successMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    isDisabled={isLoading}
                    placeholder="Enter your username"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isDisabled={isLoading}
                    placeholder="Enter your password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                  width="full"
                  mt={4}
                >
                  Login
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" fontSize="sm" mt={4}>
              Don't have an account?{' '}
              <Link as={RouterLink} to="/register" color="blue.300" _hover={{ color: 'blue.200' }}>
                Sign up
              </Link>
            </Text>
          </VStack>
        </Card>
      </Container>
    </Center>
  );
};

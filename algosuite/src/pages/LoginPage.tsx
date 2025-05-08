import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Button,
  Center,
  Container,
  Heading,
  Input,
  Text,
  Alert,
} from '@chakra-ui/react';
import { Card } from '../components/Card';
import { VStack } from '../components/ui/stack';
import { NavLink as Link } from '../components/ui/link';
import { Field } from '@chakra-ui/react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to dashboard
  // Handle both string path and full Location object for backward compatibility
  const from = location.state?.from
    ? typeof location.state.from === 'string'
      ? location.state.from
      : location.state.from.pathname
    : '/dashboard';

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
              <Alert.Root status="error" borderRadius="md" bg="red.800" color="white">
                <Alert.Indicator />
                <Alert.Content>{error}</Alert.Content>
              </Alert.Root>
            )}

            {successMessage && (
              <Alert.Root status="success" borderRadius="md" bg="green.800" color="white">
                <Alert.Indicator />
                <Alert.Content>{successMessage}</Alert.Content>
              </Alert.Root>
            )}

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Field.Root required>
                  <Field.Label htmlFor="username">Username</Field.Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter your username"
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label htmlFor="password">Password</Field.Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter your password"
                  />
                </Field.Root>

                <Button
                  type="submit"
                  variant="solid"
                  loading={isLoading}
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
              <Link to="/register" color="blue.300" _hover={{ color: 'blue.200' }}>
                Sign up
              </Link>
            </Text>
          </VStack>
        </Card>
      </Container>
    </Center>
  );
};

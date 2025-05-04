import { useState, FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    // Reset error
    setError(null);

    // Check if all fields are filled
    if (!email || !fullName || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Check password strength (at least 8 characters with at least one number and one letter)
    // This regex allows special characters as well
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and contain at least one letter and one number. Special characters are allowed.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(email, fullName, password);
      // Redirect to login page after successful registration
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
              Create an Account
            </Heading>

            {error && (
              <Alert status="error" borderRadius="md" bg="red.800" color="white">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isDisabled={isLoading}
                    placeholder="your.email@example.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="fullName">Full Name</FormLabel>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    isDisabled={isLoading}
                    placeholder="John Doe"
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
                    placeholder="Minimum 8 characters"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isDisabled={isLoading}
                    placeholder="Confirm your password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                  width="full"
                  mt={4}
                >
                  Create Account
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" fontSize="sm" mt={4}>
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="blue.300" _hover={{ color: 'blue.200' }}>
                Log in
              </Link>
            </Text>
          </VStack>
        </Card>
      </Container>
    </Center>
  );
};

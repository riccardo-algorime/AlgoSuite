import { ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  Link,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const { authState, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" bg="background.card" py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg" m={0}>
              <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                AlgoSuite
              </Link>
            </Heading>
            <HStack spacing={6} align="center">
              <Link as={RouterLink} to="/" _hover={{ color: 'white' }}>
                Home
              </Link>
              <Link as={RouterLink} to="/about" _hover={{ color: 'white' }}>
                About
              </Link>
              {authState.isAuthenticated ? (
                <>
                  <Text fontSize="sm" color="text.secondary">
                    {authState.user?.email || 'User'}
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link as={RouterLink} to="/login" _hover={{ color: 'white' }}>
                    Login
                  </Link>
                  <Link as={RouterLink} to="/register" _hover={{ color: 'white' }}>
                    Register
                  </Link>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>
      <Box as="main" flex="1" py={8}>
        <Container maxW="container.xl">
          {children}
        </Container>
      </Box>
      <Box as="footer" bg="background.card" py={4} textAlign="center">
        <Container maxW="container.xl">
          <Text fontSize="sm" color="text.secondary">
            © {new Date().getFullYear()} AlgoSuite. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Flex>
  )
}

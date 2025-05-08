import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text
} from '@chakra-ui/react'
import { ThemeToggle } from './ThemeToggle'
import { HStack } from './ui/stack'
import { NavLink } from './ui/link'

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
              <NavLink to="/" _hover={{ textDecoration: 'none' }}>
                AlgoSuite
              </NavLink>
            </Heading>
            <HStack spacing={6} align="center">
              <NavLink to="/">
                Home
              </NavLink>
              {authState.isAuthenticated && (
                <NavLink to="/dashboard">
                  Dashboard
                </NavLink>
              )}
              <NavLink to="/about">
                About
              </NavLink>
              <NavLink to="/components">
                Components
              </NavLink>
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
                  <NavLink to="/login">
                    Login
                  </NavLink>
                  <NavLink to="/register">
                    Register
                  </NavLink>
                </>
              )}
              <ThemeToggle />
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

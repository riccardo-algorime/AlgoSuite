import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react'
import { HStack } from './ui/stack'
import { NavLink } from './ui/link'
import {
  DashboardIcon,
  AssetsIcon,
  ScansIcon,
  TemplatesIcon,
  DocsIcon,
  SettingsIcon
} from './icons/NavIcons'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  // Define navigation item type
  type NavItem = {
    path: string;
    label: string;
    icon: React.ComponentType<any>;
    exists: boolean;
  };

  // Define the main navigation items
  const mainNavItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon, exists: true },
    { path: '/studio', label: 'Studio', icon: TemplatesIcon, exists: true },
    { path: '/assets', label: 'Assets', icon: AssetsIcon, exists: false },
    { path: '/scans', label: 'Scans', icon: ScansIcon, exists: false },
    { path: '/templates', label: 'Templates', icon: TemplatesIcon, exists: false },
  ]

  return (
    <Flex direction="column" minH="100vh">
      {/* Main Navigation Bar */}
      <Box as="header" bg="#050505" py={2} borderBottom="1px solid #333">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            {/* Logo and Main Nav */}
            <HStack spacing={8} align="center">
              {/* Logo */}
              <HStack spacing={2}>
                <NavLink to="/" _hover={{ textDecoration: 'none' }}>
                  <Heading as="h1" size="md" color="white" m={0}>
                    ricardobevoni
                  </Heading>
                </NavLink>
                <Button
                  size="xs"
                  variant="outline"
                  color="white"
                  borderColor="gray.600"
                  _hover={{ bg: 'gray.800' }}
                >
                  FREE
                </Button>
              </HStack>

              {/* Main Navigation */}
              <HStack spacing={4} align="center">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.exists ? item.path : '#'}
                    color="white"
                    opacity={isActive(item.path) ? 1 : 0.7}
                    _hover={{ opacity: 1 }}
                    display="flex"
                    alignItems="center"
                    onClick={!item.exists ? (e) => e.preventDefault() : undefined}
                  >
                    <Box mr={2}>
                      <item.icon boxSize={5} />
                    </Box>
                    {item.label}
                  </NavLink>
                ))}
              </HStack>
            </HStack>

            {/* Right Side Controls */}
            <HStack spacing={4} align="center">
              <Button
                variant="outline"
                size="sm"
                color="white"
                borderColor="gray.600"
                _hover={{ bg: 'gray.800' }}
              >
                Feedback
              </Button>
              <Button
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: 'gray.800' }}
              >
                Changelog
              </Button>
              <NavLink
                to="/docs"
                color="white"
                opacity={0.7}
                _hover={{ opacity: 1 }}
              >
                <DocsIcon boxSize={5} />
              </NavLink>
              <Button
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: 'gray.800' }}
                p={1}
              >
                <SettingsIcon boxSize={5} />
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Box as="main" flex="1" py={8} bg="#050505" color="white">
        <Container maxW="container.xl">
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" bg="#050505" py={4} textAlign="center" borderTop="1px solid #333">
        <Container maxW="container.xl">
          <Text fontSize="sm" color="gray.500">
            © {new Date().getFullYear()} AlgoSuite. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Flex>
  )
}

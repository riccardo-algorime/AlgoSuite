import { chakra, HTMLChakraProps } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { ReactNode } from 'react'
import { useColorModeValue } from '../../hooks/useColorMode'

interface ChakraLinkProps extends HTMLChakraProps<'a'> {
  children: ReactNode
  href?: string
  isExternal?: boolean
}

export const Link = ({
  children,
  href,
  isExternal,
  ...rest
}: ChakraLinkProps) => {
  // Create an anchor element with chakra
  const Anchor = chakra('a')

  return (
    <Anchor
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      color="blue.500"
      _hover={{ textDecoration: 'underline' }}
      {...rest}
    >
      {children}
    </Anchor>
  )
}

interface RouterLinkProps extends Omit<HTMLChakraProps<typeof RouterLink>, 'as'> {
  children: ReactNode
  to: string
}

export const NavLink = ({
  children,
  to,
  ...rest
}: RouterLinkProps) => {
  const hoverColor = useColorModeValue('blue.600', 'white')

  // Create a custom RouterLink with chakra
  const ChakraRouterLink = chakra(RouterLink)

  return (
    <ChakraRouterLink
      to={to}
      color="text.primary"
      _hover={{ color: hoverColor }}
      {...rest}
    >
      {children}
    </ChakraRouterLink>
  )
}

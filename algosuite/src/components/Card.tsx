import { Box, BoxProps, Heading, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { VStack } from './ui/stack'

interface CardProps extends BoxProps {
  title?: string
  subtitle?: string
  children: ReactNode
}

export const Card = ({ title, subtitle, children, ...rest }: CardProps) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={6}
      boxShadow="sm"
      bg="background.card"
      borderColor="border.subtle"
      {...rest}
    >
      <VStack align="stretch" spacing={4}>
        {title && (
          <Box>
            <Heading as="h3" size="md" color="text.primary">
              {title}
            </Heading>
            {subtitle && (
              <Text color="text.secondary" mt={1}>
                {subtitle}
              </Text>
            )}
          </Box>
        )}
        {children}
      </VStack>
    </Box>
  )
}

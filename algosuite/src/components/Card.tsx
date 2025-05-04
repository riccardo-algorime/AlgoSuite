import { Box, BoxProps, Heading, Text, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'

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
      boxShadow="md"
      bg="gray.800"
      {...rest}
    >
      <VStack align="stretch" spacing={4}>
        {title && (
          <Box>
            <Heading as="h3" size="md">
              {title}
            </Heading>
            {subtitle && (
              <Text color="gray.400" mt={1}>
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

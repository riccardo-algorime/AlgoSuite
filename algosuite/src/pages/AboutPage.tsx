import {
  Box,
  Container,
  Divider,
  Heading,
  Link,
  Text,
  VStack
} from '@chakra-ui/react'

export const AboutPage = () => {
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={12} align="stretch">
        <Box as="section">
          <Heading as="h1" size="2xl" mb={4}>
            About AlgoSuite
          </Heading>
          <Text fontSize="xl" color="text.secondary">
            AlgoSuite is a modern web application designed to provide powerful algorithmic tools
            for businesses and individuals. Our mission is to make complex algorithms accessible
            and useful for everyday tasks.
          </Text>
        </Box>

        <Box as="section">
          <Heading as="h2" size="xl" mb={4}>
            Our Technology
          </Heading>
          <Text fontSize="lg">
            Built with modern web technologies including React and TypeScript,
            AlgoSuite delivers a fast, responsive, and intuitive user experience. Our backend
            services are powered by high-performance algorithms optimized for speed and accuracy.
          </Text>
        </Box>

        <Divider borderColor="border.subtle" />

        <Box as="section">
          <Heading as="h2" size="xl" mb={4}>
            Contact Us
          </Heading>
          <Text fontSize="lg">
            Have questions or feedback? We'd love to hear from you.
            Email us directly at{' '}
            <Link href="mailto:support@algosuite.com" color="blue.300" _hover={{ color: 'blue.200' }}>
              support@algosuite.com
            </Link>.
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

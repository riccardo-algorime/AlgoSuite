import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Text,
  VStack
} from '@chakra-ui/react'
import { Card } from '../components/Card'

export const HomePage = () => {
  return (
    <VStack spacing={12} align="stretch">
      <Box
        as="section"
        bg="background.card"
        py={16}
        textAlign="center"
      >
        <Container maxW="container.lg">
          <Heading as="h1" size="2xl" mb={4}>
            Welcome to AlgoSuite
          </Heading>
          <Text
            fontSize="xl"
            maxW="600px"
            mx="auto"
            color="text.secondary"
          >
            A powerful suite of algorithmic tools for your business needs
          </Text>
        </Container>
      </Box>

      <Box as="section" py={8}>
        <Container maxW="container.lg">
          <Card p={8}>
            <VStack spacing={6} align="flex-start">
              <Heading as="h2" size="xl">
                Get Started
              </Heading>
              <Text fontSize="lg">
                AlgoSuite provides a comprehensive set of tools to help you analyze data,
                optimize processes, and make better decisions.
              </Text>
              <Button variant="primary" size="lg">
                Explore Features
              </Button>
            </VStack>
          </Card>
        </Container>
      </Box>

      <Box as="section" py={8}>
        <Container maxW="container.lg">
          <Heading as="h2" size="xl" textAlign="center" mb={10}>
            Our Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            <Card title="Data Analysis">
              <Text>Powerful tools for analyzing complex datasets and extracting valuable insights.</Text>
            </Card>
            <Card title="Process Optimization">
              <Text>Optimize your business processes with our advanced algorithms.</Text>
            </Card>
            <Card title="Predictive Analytics">
              <Text>Forecast future trends and make data-driven decisions with confidence.</Text>
            </Card>
            <Card title="Custom Solutions">
              <Text>Tailored algorithmic solutions designed to meet your specific business needs.</Text>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>
    </VStack>
  )
}

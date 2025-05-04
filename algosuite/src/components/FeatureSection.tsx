import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { Card } from './Card'

interface Feature {
  title: string
  description: string
}

const features: Feature[] = [
  {
    title: 'Data Analysis',
    description: 'Powerful tools for analyzing complex datasets and extracting valuable insights.',
  },
  {
    title: 'Process Optimization',
    description: 'Optimize your business processes with our advanced algorithms.',
  },
  {
    title: 'Predictive Analytics',
    description: 'Forecast future trends and make data-driven decisions with confidence.',
  },
  {
    title: 'Custom Solutions',
    description: 'Tailored algorithmic solutions designed to meet your specific business needs.',
  },
]

export const FeatureSection = () => {
  return (
    <Box my={12}>
      <Heading as="h2" size="xl" textAlign="center" mb={8}>
        Our Features
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
        {features.map((feature, index) => (
          <Card key={index} title={feature.title}>
            <Text>{feature.description}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  )
}

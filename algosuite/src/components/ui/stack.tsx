import { Flex, FlexProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface StackProps extends FlexProps {
  spacing?: number | string
  children: ReactNode
}

export const HStack = ({ spacing = 2, children, ...rest }: StackProps) => {
  return (
    <Flex
      display="flex"
      flexDirection="row"
      gap={spacing}
      {...rest}
    >
      {children}
    </Flex>
  )
}

export const VStack = ({ spacing = 2, children, ...rest }: StackProps) => {
  return (
    <Flex
      display="flex"
      flexDirection="column"
      gap={spacing}
      {...rest}
    >
      {children}
    </Flex>
  )
}

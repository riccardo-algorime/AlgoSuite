import { Box, BoxProps } from '@chakra-ui/react'
import { useColorModeValue } from '../../hooks/useColorMode'

interface DividerProps extends BoxProps {
  orientation?: 'horizontal' | 'vertical'
  borderColor?: string
}

export const Divider = ({
  orientation = 'horizontal',
  borderColor,
  ...rest
}: DividerProps) => {
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.700')
  const finalBorderColor = borderColor || defaultBorderColor

  const isHorizontal = orientation === 'horizontal'

  return (
    <Box
      as="hr"
      role="separator"
      aria-orientation={orientation}
      border="0"
      borderBottomWidth={isHorizontal ? '1px' : '0'}
      borderLeftWidth={!isHorizontal ? '1px' : '0'}
      borderColor={finalBorderColor}
      opacity={0.6}
      width={isHorizontal ? '100%' : 'auto'}
      height={!isHorizontal ? '100%' : 'auto'}
      {...rest}
    />
  )
}

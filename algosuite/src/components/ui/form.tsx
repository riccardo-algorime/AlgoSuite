import { chakra, HTMLChakraProps } from '@chakra-ui/react'
import { ReactNode, forwardRef } from 'react'

// FormControl component
interface FormControlProps extends HTMLChakraProps<'div'> {
  children: ReactNode
  isInvalid?: boolean
  isRequired?: boolean
}

export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ children, isInvalid, ...rest }, ref) => {
    return (
      <chakra.div
        ref={ref}
        role="group"
        position="relative"
        data-invalid={isInvalid ? true : undefined}
        {...rest}
      >
        {children}
      </chakra.div>
    )
  }
)

FormControl.displayName = 'FormControl'

// FormLabel component
interface FormLabelProps extends HTMLChakraProps<'label'> {
  children: ReactNode
  htmlFor?: string
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, htmlFor, ...rest }, ref) => {
    return (
      <chakra.label
        ref={ref}
        htmlFor={htmlFor}
        display="block"
        fontSize="sm"
        fontWeight="medium"
        color="text.secondary"
        mb={1}
        {...rest}
      >
        {children}
      </chakra.label>
    )
  }
)

FormLabel.displayName = 'FormLabel'

// FormErrorMessage component
interface FormErrorMessageProps extends HTMLChakraProps<'div'> {
  children: ReactNode
}

export const FormErrorMessage = forwardRef<HTMLDivElement, FormErrorMessageProps>(
  ({ children, ...rest }, ref) => {
    return (
      <chakra.div
        ref={ref}
        color="red.500"
        fontSize="sm"
        mt={1}
        {...rest}
      >
        {children}
      </chakra.div>
    )
  }
)

FormErrorMessage.displayName = 'FormErrorMessage'

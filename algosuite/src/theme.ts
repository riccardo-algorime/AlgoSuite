import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// Color mode configuration
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

// Define color palette
const colors = {
  background: {
    page: '#0A0A0A',
    card: '#1A1A1A',
    input: '#2C2C2C',
  },
  text: {
    primary: '#F0F0F0',
    secondary: '#A0AEC0',
    placeholder: '#718096',
  },
  border: {
    subtle: '#333333',
  },
  button: {
    primary: {
      bg: '#F0F0F0',
      text: '#1A1A1A',
    },
    secondary: {
      bg: 'transparent',
      text: '#F0F0F0',
      border: '#333333',
    },
  },
}

// Define typography
const typography = {
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: 2,
  },
}

// Define spacing
const spacing = {
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },
}

// Define border radius
const radii = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}

// Component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      primary: {
        bg: 'button.primary.bg',
        color: 'button.primary.text',
        _hover: {
          bg: 'gray.200',
        },
      },
      secondary: {
        bg: 'button.secondary.bg',
        color: 'button.secondary.text',
        border: '1px solid',
        borderColor: 'button.secondary.border',
        _hover: {
          borderColor: 'text.primary',
        },
      },
      outline: {
        bg: 'transparent',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'border.subtle',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    defaultProps: {
      variant: 'primary',
      size: 'md',
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: 'background.input',
          borderColor: 'border.subtle',
          color: 'text.primary',
          _placeholder: {
            color: 'text.placeholder',
          },
          _hover: {
            borderColor: 'gray.500',
          },
          _focus: {
            borderColor: 'gray.400',
            boxShadow: 'none',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
    },
  },
  Textarea: {
    variants: {
      outline: {
        bg: 'background.input',
        borderColor: 'border.subtle',
        color: 'text.primary',
        _placeholder: {
          color: 'text.placeholder',
        },
        _hover: {
          borderColor: 'gray.500',
        },
        _focus: {
          borderColor: 'gray.400',
          boxShadow: 'none',
        },
      },
    },
    defaultProps: {
      variant: 'outline',
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'background.card',
        borderRadius: 'lg',
        p: 6,
        boxShadow: 'md',
      },
    },
  },
  FormLabel: {
    baseStyle: {
      color: 'text.secondary',
      fontSize: 'sm',
      fontWeight: 'medium',
      mb: 1,
    },
  },
  FormError: {
    baseStyle: {
      text: {
        color: 'red.300',
        fontSize: 'sm',
        mt: 1,
      },
    },
  },
  Link: {
    baseStyle: {
      color: 'text.primary',
      _hover: {
        textDecoration: 'none',
        color: 'white',
      },
    },
  },
}

// Global styles
const styles = {
  global: {
    body: {
      bg: 'background.page',
      color: 'text.primary',
      fontFamily: 'body',
      lineHeight: 'base',
    },
    a: {
      color: 'text.primary',
      textDecoration: 'none',
      _hover: {
        textDecoration: 'none',
      },
    },
  },
}

// Extend the theme
const theme = extendTheme({
  config,
  colors,
  ...typography,
  ...spacing,
  radii,
  components,
  styles,
})

export default theme

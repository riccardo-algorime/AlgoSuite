import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// Color mode configuration will be set in the ColorModeProvider

// Define semantic tokens for light/dark mode
const semanticTokens = {
  colors: {
    "background.page": {
      value: { base: '#F7FAFC', _dark: '#0A0A0A' },
    },
    "background.card": {
      value: { base: '#FFFFFF', _dark: '#1A1A1A' },
    },
    "background.input": {
      value: { base: '#EDF2F7', _dark: '#2C2C2C' },
    },
    "text.primary": {
      value: { base: '#1A202C', _dark: '#F0F0F0' },
    },
    "text.secondary": {
      value: { base: '#4A5568', _dark: '#A0AEC0' },
    },
    "text.placeholder": {
      value: { base: '#A0AEC0', _dark: '#718096' },
    },
    "border.subtle": {
      value: { base: '#E2E8F0', _dark: '#333333' },
    },
    "button.primary.bg": {
      value: { base: '#3182CE', _dark: '#F0F0F0' },
    },
    "button.primary.text": {
      value: { base: '#FFFFFF', _dark: '#1A1A1A' },
    },
    "button.secondary.bg": {
      value: { base: 'transparent', _dark: 'transparent' },
    },
    "button.secondary.text": {
      value: { base: '#3182CE', _dark: '#F0F0F0' },
    },
    "button.secondary.border": {
      value: { base: '#CBD5E0', _dark: '#333333' },
    },
  },
}

// Define tokens
const tokens = {
  fonts: {
    body: { value: 'Inter, system-ui, sans-serif' },
    heading: { value: 'Inter, system-ui, sans-serif' },
  },
  fontSizes: {
    xs: { value: '0.75rem' },
    sm: { value: '0.875rem' },
    md: { value: '1rem' },
    lg: { value: '1.125rem' },
    xl: { value: '1.25rem' },
    '2xl': { value: '1.5rem' },
    '3xl': { value: '1.875rem' },
    '4xl': { value: '2.25rem' },
    '5xl': { value: '3rem' },
  },
  fontWeights: {
    normal: { value: 400 },
    medium: { value: 500 },
    semibold: { value: 600 },
    bold: { value: 700 },
  },
  lineHeights: {
    normal: { value: 'normal' },
    none: { value: 1 },
    shorter: { value: 1.25 },
    short: { value: 1.375 },
    base: { value: 1.5 },
    tall: { value: 1.625 },
    taller: { value: 2 },
  },
  spacing: {
    px: { value: '1px' },
    '0.5': { value: '0.125rem' },
    '1': { value: '0.25rem' },
    '1.5': { value: '0.375rem' },
    '2': { value: '0.5rem' },
    '2.5': { value: '0.625rem' },
    '3': { value: '0.75rem' },
    '3.5': { value: '0.875rem' },
    '4': { value: '1rem' },
    '5': { value: '1.25rem' },
    '6': { value: '1.5rem' },
    '8': { value: '2rem' },
    '10': { value: '2.5rem' },
    '12': { value: '3rem' },
    '16': { value: '4rem' },
    '20': { value: '5rem' },
    '24': { value: '6rem' },
    '32': { value: '8rem' },
    '40': { value: '10rem' },
    '48': { value: '12rem' },
    '56': { value: '14rem' },
    '64': { value: '16rem' },
  },
  radii: {
    none: { value: '0' },
    sm: { value: '0.125rem' },
    base: { value: '0.25rem' },
    md: { value: '0.375rem' },
    lg: { value: '0.5rem' },
    xl: { value: '0.75rem' },
    '2xl': { value: '1rem' },
    '3xl': { value: '1.5rem' },
    full: { value: '9999px' },
  },
}

// Note: Component styles and global styles are commented out for now
// They need to be converted to the new Chakra UI v3 format in a future update
/*
// Component styles would be defined using defineRecipe or defineSlotRecipe
// Global styles would be defined in the theme config
*/

// Create the theme system
const customConfig = defineConfig({
  theme: {
    semanticTokens,
    tokens,
  },
  // We'll need to convert components and styles to the new format in a future update
  // For now, we'll use the basic configuration
})

const theme = createSystem(defaultConfig, customConfig)

export default theme

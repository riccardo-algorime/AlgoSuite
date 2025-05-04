import { createContext } from 'react'

// Define the color mode context type
export type ColorMode = 'light' | 'dark'
export type ColorModeContextType = {
  colorMode: ColorMode
  toggleColorMode: () => void
  setColorMode: (mode: ColorMode) => void
}

// Create the context with a default value
export const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined)

import { useState, useEffect, ReactNode } from 'react'
import { ColorModeContext, ColorMode } from './color-mode-context'
import { useColorMode } from './use-color-mode'

// Props for the ColorModeProvider
interface ColorModeProviderProps {
  children: ReactNode
  forcedTheme?: ColorMode
}

// Local storage key for color mode
const COLOR_MODE_KEY = 'chakra-ui-color-mode'

// ColorModeProvider component
export function ColorModeProvider({ children, forcedTheme }: ColorModeProviderProps) {
  // Initialize color mode from local storage or default to 'dark'
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    // If forcedTheme is provided, use it
    if (forcedTheme) {
      return forcedTheme
    }

    // Check local storage
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(COLOR_MODE_KEY) as ColorMode
      return savedMode || 'dark'
    }

    return 'dark'
  })

  // Set color mode and save to local storage
  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode)

    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(COLOR_MODE_KEY, mode)
    }

    // Apply class to document for CSS targeting
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light')
  }

  // Apply the initial color mode class to document
  useEffect(() => {
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [colorMode])

  // Provide the color mode context
  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode, setColorMode }}>
      {children}
    </ColorModeContext.Provider>
  )
}



// Components for forcing a specific color mode
export function LightMode({ children }: { children: ReactNode }) {
  return <ColorModeProvider forcedTheme="light">{children}</ColorModeProvider>
}

export function DarkMode({ children }: { children: ReactNode }) {
  return <ColorModeProvider forcedTheme="dark">{children}</ColorModeProvider>
}



// Button component for toggling color mode
export function ColorModeButton() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <button
      onClick={toggleColorMode}
      aria-label={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}

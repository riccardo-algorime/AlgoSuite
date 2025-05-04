import React from 'react'
import { ColorModeContext } from './color-mode-context'

// Hook to use the color mode context
export function useColorMode() {
  const context = React.useContext(ColorModeContext)
  if (context === undefined) {
    throw new Error('useColorMode must be used within a ColorModeProvider')
  }
  return context
}

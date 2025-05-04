import { useContext } from 'react';
import { ColorModeContext } from '../components/ui/color-mode-context';

// Custom hook to use the color mode context
export function useColorMode() {
  const context = useContext(ColorModeContext);

  if (context === undefined) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }

  return context;
}

// Hook to get different values based on color mode
export function useColorModeValue<T>(lightValue: T, darkValue: T): T {
  const { colorMode } = useColorMode();
  return colorMode === 'light' ? lightValue : darkValue;
}

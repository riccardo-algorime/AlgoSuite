import { Button, Tooltip } from '@chakra-ui/react'
import { SunIcon, MoonIcon } from './icons'
import { useColorMode } from '../../hooks/useColorMode'

export const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button
          aria-label={label}
          variant="ghost"
          size="md"
          onClick={toggleColorMode}
          _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip.Root>
  )
}

import { SurfaceType } from '../types/index';

/**
 * Get the appropriate color scheme for a surface type
 * @param type Surface type
 * @returns Chakra UI color scheme name
 */
export function getSurfaceTypeColorScheme(type: SurfaceType): string {
  switch (type) {
    case SurfaceType.WEB:
      return 'blue';
    case SurfaceType.API:
      return 'green';
    case SurfaceType.MOBILE:
      return 'purple';
    case SurfaceType.NETWORK:
      return 'orange';
    case SurfaceType.CLOUD:
      return 'cyan';
    case SurfaceType.IOT:
      return 'pink';
    case SurfaceType.OTHER:
    default:
      return 'gray';
  }
}

/**
 * Format surface type for display
 * @param type Surface type
 * @returns Formatted surface type string
 */
export function formatSurfaceType(type: SurfaceType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Get an icon for a surface type
 * @param type Surface type
 * @returns Icon character
 */
export function getSurfaceTypeIcon(type: SurfaceType): string {
  switch (type) {
    case SurfaceType.WEB:
      return '🌐';
    case SurfaceType.API:
      return '🔌';
    case SurfaceType.MOBILE:
      return '📱';
    case SurfaceType.NETWORK:
      return '🔄';
    case SurfaceType.CLOUD:
      return '☁️';
    case SurfaceType.IOT:
      return '🔗';
    case SurfaceType.OTHER:
    default:
      return '🔍';
  }
}

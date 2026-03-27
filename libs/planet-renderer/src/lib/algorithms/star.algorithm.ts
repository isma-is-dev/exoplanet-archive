import { lightenHex, darkenHex } from './color.algorithm';
import { getViewBoxSize } from './size.algorithm';

export interface StarColors {
  primary: string;
  secondary: string;
  glow: string;
  core: string;
  spectralClass: string;
}

/**
 * Calculates stellar color properties based on temperature
 * Based on blackbody radiation spectra
 */
export function getStarColors(tempK: number | null): StarColors {
  const t = tempK ?? 5778; // Default to Sun

  // Determines spectral class and base color
  let primary = '#ffffff';
  let spectralClass = 'G';

  if (t < 3500) {
    primary = '#ff5b4f'; // M - Red
    spectralClass = 'M';
  } else if (t < 5000) {
    primary = '#ff9d5c'; // K - Orange
    spectralClass = 'K';
  } else if (t < 6000) {
    primary = '#ffda75'; // G - Yellow
    spectralClass = 'G';
  } else if (t < 7500) {
    primary = '#fff4e8'; // F - Yellow-white
    spectralClass = 'F';
  } else if (t < 10000) {
    primary = '#ffffff'; // A - White
    spectralClass = 'A';
  } else if (t < 30000) {
    primary = '#d6e5ff'; // B - Blue-white
    spectralClass = 'B';
  } else {
    primary = '#8ca8ff'; // O - Blue
    spectralClass = 'O';
  }

  // Adjust brightness/saturation for visual effect
  // Stars are very bright in the core, and glow with their primary color
  const core = '#ffffff'; 
  const secondary = t < 6000 ? darkenHex(primary, 0.1) : lightenHex(primary, 0.1);
  const glow = primary;

  return { primary, secondary, glow, core, spectralClass };
}

/**
 * Calculates visual radius for a star
 * Since stars vary greatly in size, we use a logarithmic scale to keep them visible
 */
export function getStarVisualRadius(radiusSun: number | null, sizeClass: 'card' | 'detail' | 'micro'): number {
  const r = radiusSun ?? 1.0;
  const viewBox = getViewBoxSize(sizeClass);
  const maxRadius = viewBox * 0.45; // Leave room for flares/corona
  
  // Base visual radius is 25% of viewBox for a Sun-like star
  const baseRadius = viewBox * 0.25;
  
  // Use a damped logarithmic scale so giant stars don't fill the box completely,
  // and tiny red dwarfs don't become invisible
  let scaledRadius = baseRadius;
  
  if (r > 1) {
    scaledRadius = baseRadius + (Math.log10(r) * baseRadius * 0.3);
  } else if (r < 1) {
    // scale down slowly
    scaledRadius = baseRadius - (Math.abs(Math.log10(r)) * baseRadius * 0.15);
  }

  // Ensure it doesn't exceed bounds
  return Math.min(Math.max(scaledRadius, viewBox * 0.1), maxRadius);
}

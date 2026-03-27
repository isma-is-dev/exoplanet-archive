import { PlanetType } from '@exodex/shared-types';

export interface PlanetColors {
  primary: string;
  secondary: string;
}

export function getPlanetColors(
  planetType: PlanetType,
  equilibriumTempK: number | null
): PlanetColors {
  // hot-jupiter o temp > 1200K
  if (planetType === 'hot-jupiter' || (equilibriumTempK !== null && equilibriumTempK > 1200)) {
    return { primary: '#E8593C', secondary: '#F2A623' };
  }

  // jovian (frío)
  if (planetType === 'jovian') {
    return { primary: '#E8A96A', secondary: '#C87D3E' };
  }

  // cold-giant
  if (planetType === 'cold-giant') {
    return { primary: '#8BA4C7', secondary: '#5A7A9A' };
  }

  // neptunian
  if (planetType === 'neptunian') {
    if (equilibriumTempK !== null && equilibriumTempK < 300) {
      return { primary: '#4A90D9', secondary: '#6DB8E8' };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 300 && equilibriumTempK <= 700) {
      return { primary: '#7B68C8', secondary: '#A492E0' };
    }
    return { primary: '#4A90D9', secondary: '#6DB8E8' };
  }

  // mini-neptune
  if (planetType === 'mini-neptune') {
    if (equilibriumTempK !== null && equilibriumTempK < 300) {
      return { primary: '#4A90D9', secondary: '#6DB8E8' };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 300 && equilibriumTempK <= 700) {
      return { primary: '#7B68C8', secondary: '#A492E0' };
    }
    return { primary: '#7B68C8', secondary: '#A492E0' };
  }

  // super-earth
  if (planetType === 'super-earth') {
    if (equilibriumTempK !== null && equilibriumTempK < 260) {
      return { primary: '#5BB4A0', secondary: '#3D8C7A' };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 260 && equilibriumTempK <= 320) {
      return { primary: '#6BB86E', secondary: '#4A9A4E' };
    }
    return { primary: '#D4835A', secondary: '#B5603C' };
  }

  // rocky-terrestrial
  if (planetType === 'rocky-terrestrial') {
    if (equilibriumTempK !== null && equilibriumTempK < 200) {
      return { primary: '#A8C4D4', secondary: '#7A9DB0' };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 200 && equilibriumTempK <= 320) {
      return { primary: '#8B9E6A', secondary: '#6A7D50' };
    }
    return { primary: '#C4885A', secondary: '#A06440' };
  }

  // Sin datos de temperatura o unknown
  return { primary: '#7A7A7A', secondary: '#5A5A5A' };
}

export function lightenHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.min(255, Math.round(r + (255 - r) * factor));
  const newG = Math.min(255, Math.round(g + (255 - g) * factor));
  const newB = Math.min(255, Math.round(b + (255 - b) * factor));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export function darkenHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.round(r * (1 - factor));
  const newG = Math.round(g * (1 - factor));
  const newB = Math.round(b * (1 - factor));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export function desaturateHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const gray = 0.299 * r + 0.587 * g + 0.114 * b;

  const newR = Math.round(r + (gray - r) * factor);
  const newG = Math.round(g + (gray - g) * factor);
  const newB = Math.round(b + (gray - b) * factor);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export function getComplementaryColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = 255 - r;
  const newG = 255 - g;
  const newB = 255 - b;

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

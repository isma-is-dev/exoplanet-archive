import { PlanetType } from '@exodex/shared-types';

export interface PlanetColors {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
}

/**
 * Paletas realistas inspiradas en planetas reales del sistema solar y observaciones de exoplanetas.
 * Cada tipo tiene múltiples variantes que se seleccionan según temperatura.
 */
export function getPlanetColors(
  planetType: PlanetType,
  equilibriumTempK: number | null
): PlanetColors {
  // hot-jupiter o temp > 1200K — Colores incandescentes como lava
  if (planetType === 'hot-jupiter' || (equilibriumTempK !== null && equilibriumTempK > 1200)) {
    if (equilibriumTempK !== null && equilibriumTempK > 2000) {
      // Ultra-caliente: casi blanco-amarillo con rojo
      return { primary: '#D4582A', secondary: '#F0943E', tertiary: '#F5C76A', accent: '#FFE8A0' };
    }
    return { primary: '#A23520', secondary: '#D46830', tertiary: '#E8A050', accent: '#F2C878' };
  }

  // jovian — Bandas beige/naranja/marrón como Júpiter
  if (planetType === 'jovian') {
    return { primary: '#C4956A', secondary: '#A07848', tertiary: '#DEC8A0', accent: '#8B6540' };
  }

  // cold-giant — Azul pálido como Urano
  if (planetType === 'cold-giant') {
    return { primary: '#8BAEC4', secondary: '#6B92AA', tertiary: '#A8C8DA', accent: '#587D95' };
  }

  // neptunian — Azul profundo como Neptuno
  if (planetType === 'neptunian') {
    if (equilibriumTempK !== null && equilibriumTempK < 200) {
      // Muy frío: azul hielo
      return { primary: '#4A78B4', secondary: '#6A9ACC', tertiary: '#3A5C8A', accent: '#8AB4D8' };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 200 && equilibriumTempK <= 500) {
      // Templado: azul-púrpura profundo
      return { primary: '#3E5A90', secondary: '#5874A8', tertiary: '#2C4470', accent: '#7A96C0' };
    }
    // Caliente: tonos más púrpura
    return { primary: '#5A4A80', secondary: '#7868A0', tertiary: '#443868', accent: '#9888B8' };
  }

  // mini-neptune — Similar a neptuniano pero más suave
  if (planetType === 'mini-neptune') {
    if (equilibriumTempK !== null && equilibriumTempK < 300) {
      return { primary: '#5080B0', secondary: '#6898C4', tertiary: '#3C6890', accent: '#80B0D4' };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 300 && equilibriumTempK <= 700) {
      return { primary: '#6058A0', secondary: '#7870B4', tertiary: '#4C4488', accent: '#9488C8' };
    }
    return { primary: '#5868A0', secondary: '#7080B8', tertiary: '#445488', accent: '#8898CC' };
  }

  // super-earth — Colores terrestres con carácter
  if (planetType === 'super-earth') {
    if (equilibriumTempK !== null && equilibriumTempK < 260) {
      // Frío: mundo de hielo/tundra, gris-azulado
      return { primary: '#7A9AA4', secondary: '#5A7880', tertiary: '#9AB4BC', accent: '#486068' };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 260 && equilibriumTempK <= 320) {
      // Templado: mundo tipo Tierra, verde oliva + azul oceánico
      return { primary: '#6A8458', secondary: '#4A6A40', tertiary: '#88A470', accent: '#3A5A68' };
    }
    // Caliente: mundo árido, ocre/siena
    return { primary: '#B4784A', secondary: '#8C5A34', tertiary: '#D49868', accent: '#6A4228' };
  }

  // rocky-terrestrial — Rocosos como Marte, Luna, Mercurio
  if (planetType === 'rocky-terrestrial') {
    if (equilibriumTempK !== null && equilibriumTempK < 200) {
      // Frío: como Europa/Encélado — gris hielo
      return { primary: '#98A4AC', secondary: '#788890', tertiary: '#B0BAC2', accent: '#606C74' };
    }
    if (equilibriumTempK !== null && equilibriumTempK >= 200 && equilibriumTempK <= 320) {
      // Templado: tipo Marte, rojo-marrón terroso
      return { primary: '#9A7A5A', secondary: '#7A6044', tertiary: '#B49470', accent: '#5A4830' };
    }
    // Caliente: volcánico, gris oscuro con tintes rojos
    return { primary: '#8A6A50', secondary: '#6A5040', tertiary: '#A48468', accent: '#504038' };
  }

  // Sin tipo / unknown — gris neutro
  return { primary: '#787878', secondary: '#5A5A5A', tertiary: '#949494', accent: '#404040' };
}

// ─── Color utilities ──────────────────────────────────────────

export function lightenHex(hex: string, factor: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(
    Math.min(255, Math.round(r + (255 - r) * factor)),
    Math.min(255, Math.round(g + (255 - g) * factor)),
    Math.min(255, Math.round(b + (255 - b) * factor))
  );
}

export function darkenHex(hex: string, factor: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(
    Math.round(r * (1 - factor)),
    Math.round(g * (1 - factor)),
    Math.round(b * (1 - factor))
  );
}

export function desaturateHex(hex: string, factor: number): string {
  const [r, g, b] = parseHex(hex);
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  return toHex(
    Math.round(r + (gray - r) * factor),
    Math.round(g + (gray - g) * factor),
    Math.round(b + (gray - b) * factor)
  );
}

export function mixHex(hex1: string, hex2: string, t: number): string {
  const [r1, g1, b1] = parseHex(hex1);
  const [r2, g2, b2] = parseHex(hex2);
  return toHex(
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t)
  );
}

export function getComplementaryColor(hex: string): string {
  const [r, g, b] = parseHex(hex);
  return toHex(255 - r, 255 - g, 255 - b);
}

function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

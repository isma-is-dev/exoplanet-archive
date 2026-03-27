import { PlanetType } from '@exodex/shared-types';
import { desaturateHex, lightenHex, darkenHex, mixHex } from './color.algorithm';

export function shouldShowRings(
  planetType: PlanetType,
  radiusEarth: number | null
): boolean {
  return (
    (planetType === 'jovian' ||
      planetType === 'cold-giant' ||
      planetType === 'neptunian') &&
    radiusEarth !== null &&
    radiusEarth > 7
  );
}

/** Shared ring band definitions — multipliers are relative to planet radius */
function getRingBands(secondaryColor: string) {
  return [
    { innerMult: 1.28, outerMult: 1.37, color: desaturateHex(secondaryColor, 0.3), opacity: 0.25 },
    { innerMult: 1.38, outerMult: 1.46, color: mixHex(secondaryColor, darkenHex(secondaryColor, 0.15), 0.5), opacity: 0.18 },
    { innerMult: 1.48, outerMult: 1.55, color: desaturateHex(lightenHex(secondaryColor, 0.2), 0.4), opacity: 0.12 },
  ];
}

function renderBandEllipses(
  bands: ReturnType<typeof getRingBands>,
  radius: number,
  center: number
): string {
  const minorAxisRatio = 0.3;
  let svg = '';
  for (const band of bands) {
    const innerRx = radius * band.innerMult;
    const outerRx = radius * band.outerMult;
    const innerRy = innerRx * minorAxisRatio;
    const outerRy = outerRx * minorAxisRatio;
    const strokeWidth = outerRx - innerRx;
    const midRx = (innerRx + outerRx) / 2;
    const midRy = (innerRy + outerRy) / 2;
    svg += `<ellipse cx="${center}" cy="${center}" rx="${midRx}" ry="${midRy}" fill="none" stroke="${band.color}" stroke-width="${strokeWidth}" opacity="${band.opacity}"/>`;
  }
  return svg;
}

/**
 * Back rings — drawn BEFORE the planet body.
 * Clipped to the top half along the TILTED ring axis so only the portion
 * geometrically behind the planet is visible. The clip rect is rotated
 * by the same angle as the rings so the split follows the tilt correctly.
 */
export function buildRings(
  radius: number,
  center: number,
  secondaryColor: string
): string {
  const rotation = -15;
  const clipId = `ring-back-${Math.random().toString(36).substr(2, 9)}`;
  const bands = getRingBands(secondaryColor);
  const vb = center * 2;

  return `
    <defs>
      <clipPath id="${clipId}">
        <rect x="0" y="0" width="${vb}" height="${center}"
              transform="rotate(${rotation} ${center} ${center})"/>
      </clipPath>
    </defs>
    <g clip-path="url(#${clipId})" transform="rotate(${rotation} ${center} ${center})">
      ${renderBandEllipses(bands, radius, center)}
    </g>
  `;
}

/**
 * Front rings — drawn AFTER the planet body.
 * Uses an SVG mask with two elements:
 *  1. White rect covering the bottom half, ROTATED to match the ring tilt.
 *     This reveals only the portion of the rings that passes in front.
 *  2. Black circle (unrotated) centered on the planet disk.
 *     This hides any ring pixels that would overlap the planet body.
 *
 * Because the white rect rotation matches the ring rotation, the front/back
 * boundary follows the correct tilted axis and never "cuts into" the planet
 * on the right side.
 */
export function buildFrontRings(
  radius: number,
  center: number,
  secondaryColor: string
): string {
  const rotation = -15;
  const clipId = `ring-front-${Math.random().toString(36).substr(2, 9)}`;
  const bands = getRingBands(secondaryColor);
  const vb = center * 2;

  return `
    <defs>
      <clipPath id="${clipId}">
        <!-- Bottom half rect, rotated to follow ring tilt → reveals only front portion -->
        <rect x="0" y="${center}" width="${vb}" height="${center}"
              transform="rotate(${rotation} ${center} ${center})"/>
      </clipPath>
    </defs>
    <g clip-path="url(#${clipId})" transform="rotate(${rotation} ${center} ${center})">
      ${renderBandEllipses(bands, radius, center)}
    </g>
  `;
}

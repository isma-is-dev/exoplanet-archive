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

/**
 * Multi-band rings with Cassini-like gaps, opacity gradients, and shadow interaction.
 */
export function buildRings(
  radius: number,
  center: number,
  secondaryColor: string
): string {
  const rotation = -15;
  const clipBackId = `ring-back-${Math.random().toString(36).substr(2, 9)}`;
  const clipFrontId = `ring-front-${Math.random().toString(36).substr(2, 9)}`;

  // Ring bands definition — inner to outer
  const bands = [
    { innerMult: 1.25, outerMult: 1.50, color: desaturateHex(secondaryColor, 0.15), opacity: 0.20 },
    { innerMult: 1.55, outerMult: 1.80, color: mixHex(secondaryColor, lightenHex(secondaryColor, 0.3), 0.5), opacity: 0.35 },
    { innerMult: 1.82, outerMult: 2.10, color: desaturateHex(secondaryColor, 0.3), opacity: 0.25 },
    { innerMult: 2.18, outerMult: 2.50, color: mixHex(secondaryColor, darkenHex(secondaryColor, 0.15), 0.5), opacity: 0.18 },
    { innerMult: 2.55, outerMult: 2.80, color: desaturateHex(lightenHex(secondaryColor, 0.2), 0.4), opacity: 0.12 },
  ];

  const minorAxisRatio = 0.3; // Perspective flattening

  let defs = `
    <defs>
      <!-- Clip path for back rings: only top half -->
      <clipPath id="${clipBackId}">
        <rect x="0" y="0" width="${center * 2}" height="${center}" />
      </clipPath>
      <!-- Clip path for front rings: only bottom half -->
      <clipPath id="${clipFrontId}">
        <rect x="0" y="${center}" width="${center * 2}" height="${center}" />
      </clipPath>
    </defs>
  `;

  function renderBands(clipId: string): string {
    let bandsSvg = `<g clip-path="url(#${clipId})" transform="rotate(${rotation} ${center} ${center})">`;

    for (const band of bands) {
      const innerRx = radius * band.innerMult / 2;
      const outerRx = radius * band.outerMult / 2;
      const innerRy = innerRx * minorAxisRatio;
      const outerRy = outerRx * minorAxisRatio;
      const strokeWidth = outerRx - innerRx;
      const midRx = (innerRx + outerRx) / 2;
      const midRy = (innerRy + outerRy) / 2;

      bandsSvg += `<ellipse cx="${center}" cy="${center}" rx="${midRx}" ry="${midRy}" fill="none" stroke="${band.color}" stroke-width="${strokeWidth}" opacity="${band.opacity}"/>`;
    }

    bandsSvg += '</g>';
    return bandsSvg;
  }

  // Planet shadow on back rings — a dark ellipse behind the planet
  const shadowGradId = `ring-shadow-${Math.random().toString(36).substr(2, 9)}`;
  let shadowSvg = `
    <defs>
      <radialGradient id="${shadowGradId}" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.5"/>
        <stop offset="80%" stop-color="#000000" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
  `;

  return `
    ${defs}
    <!-- Back rings (behind planet) -->
    ${renderBands(clipBackId)}
    ${shadowSvg}
    <!-- Front rings will be rendered after planet body in planet-renderer.ts -->
    <g id="__front_rings__" style="display:none" data-clip="${clipFrontId}" data-rotation="${rotation}">
      ${renderBands(clipFrontId)}
    </g>
  `;
}

/**
 * Renders just the front rings (called separately to layer above the planet body).
 */
export function buildFrontRings(
  radius: number,
  center: number,
  secondaryColor: string
): string {
  const rotation = -15;
  const clipFrontId = `ring-front2-${Math.random().toString(36).substr(2, 9)}`;
  const minorAxisRatio = 0.3;

  const bands = [
    { innerMult: 1.25, outerMult: 1.50, color: desaturateHex(secondaryColor, 0.15), opacity: 0.20 },
    { innerMult: 1.55, outerMult: 1.80, color: mixHex(secondaryColor, lightenHex(secondaryColor, 0.3), 0.5), opacity: 0.35 },
    { innerMult: 1.82, outerMult: 2.10, color: desaturateHex(secondaryColor, 0.3), opacity: 0.25 },
    { innerMult: 2.18, outerMult: 2.50, color: mixHex(secondaryColor, darkenHex(secondaryColor, 0.15), 0.5), opacity: 0.18 },
    { innerMult: 2.55, outerMult: 2.80, color: desaturateHex(lightenHex(secondaryColor, 0.2), 0.4), opacity: 0.12 },
  ];

  let svg = `
    <defs>
      <clipPath id="${clipFrontId}">
        <rect x="0" y="${center}" width="${center * 2}" height="${center}" />
      </clipPath>
    </defs>
    <g clip-path="url(#${clipFrontId})" transform="rotate(${rotation} ${center} ${center})">
  `;

  for (const band of bands) {
    const innerRx = radius * band.innerMult / 2;
    const outerRx = radius * band.outerMult / 2;
    const innerRy = innerRx * minorAxisRatio;
    const outerRy = outerRx * minorAxisRatio;
    const strokeWidth = outerRx - innerRx;
    const midRx = (innerRx + outerRx) / 2;
    const midRy = (innerRy + outerRy) / 2;

    svg += `<ellipse cx="${center}" cy="${center}" rx="${midRx}" ry="${midRy}" fill="none" stroke="${band.color}" stroke-width="${strokeWidth}" opacity="${band.opacity}"/>`;
  }

  svg += '</g>';
  return svg;
}

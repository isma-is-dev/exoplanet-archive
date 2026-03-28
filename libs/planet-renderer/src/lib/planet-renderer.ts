import { PlanetRenderOutput, PlanetRenderParams } from '@exodex/shared-types';
import {
  getPlanetColors,
  lightenHex,
  darkenHex,
} from './algorithms/color.algorithm';
import { getPlanetVisualRadius, getViewBoxSize, RenderSize } from './algorithms/size.algorithm';
import { buildAtmosphereGlow } from './algorithms/atmosphere.algorithm';
import { shouldShowRings, buildRings, buildFrontRings } from './algorithms/rings.algorithm';
import { buildSurfaceDetails } from './algorithms/surface.algorithm';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function renderPlanet(
  params: PlanetRenderParams,
  planetName: string = 'unknown'
): PlanetRenderOutput {
  const {
    radiusEarth,
    massEarth,
    equilibriumTempK,
    planetType,
    densityGCC,
    eccentricity,
    insolationFlux,
    discoveryYear,
    size,
    animationsEnabled,
    orbitalPeriodDays,
  } = params;

  // Calculate dimensions
  const viewBoxSize = getViewBoxSize(size);
  const visualRadius = getPlanetVisualRadius(radiusEarth, size);
  const center = viewBoxSize / 2;

  // Get full color palette
  const colors = getPlanetColors(planetType, equilibriumTempK);
  const { primary: primaryColor, secondary: secondaryColor, tertiary: tertiaryColor, accent: accentColor } = colors;

  // Build gradients - use deterministic IDs based on planet name for SSR/hydration compatibility
  const highlightColor = lightenHex(secondaryColor, 0.35);
  const shadowColor = darkenHex(primaryColor, 0.45);
  const idSuffix = hashString(planetName + planetType).toString(36);
  const gradientId = `body-${idSuffix}`;
  const terminatorId = `term-${idSuffix}`;
  const specularId = `spec-${idSuffix}`;
  const aoId = `ao-${idSuffix}`;

  // Determine if showing rings
  const showRings = shouldShowRings(planetType, radiusEarth);

  // Should animate? Only for card and detail sizes
  const shouldAnimate = animationsEnabled && size !== 'micro';

  // ─── Assemble SVG layers in correct order ────────────────────

  let svgParts: string[] = [];

  // Layer 0: Back rings (behind everything)
  if (showRings) {
    svgParts.push(buildRings(visualRadius, center, secondaryColor));
  }

  // Layer 1: Atmosphere glow (behind planet body)
  const atmosphereSvg = buildAtmosphereGlow(
    visualRadius,
    center,
    primaryColor,
    equilibriumTempK,
    insolationFlux,
    shouldAnimate
  );
  if (atmosphereSvg) {
    svgParts.push(atmosphereSvg);
  }

  // Layer 2: Planet body — enhanced radial gradient with more stops
  const bodySvg = `
    <defs>
      <radialGradient id="${gradientId}" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="${highlightColor}"/>
        <stop offset="25%" stop-color="${lightenHex(primaryColor, 0.15)}"/>
        <stop offset="55%" stop-color="${primaryColor}"/>
        <stop offset="80%" stop-color="${darkenHex(primaryColor, 0.2)}"/>
        <stop offset="100%" stop-color="${shadowColor}"/>
      </radialGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${visualRadius}" fill="url(#${gradientId})"/>
  `;
  svgParts.push(bodySvg);

  // Layer 3: Surface details (textures, craters, bands, etc.)
  const surfaceSvg = buildSurfaceDetails(
    planetType,
    visualRadius,
    center,
    primaryColor,
    secondaryColor,
    equilibriumTempK,
    planetName,
    tertiaryColor,
    accentColor,
    shouldAnimate,
    orbitalPeriodDays
  );
  svgParts.push(surfaceSvg);

  // Layer 4: Terminator shadow — half the planet in shadow (lateral illumination)
  const terminatorSvg = `
    <defs>
      <linearGradient id="${terminatorId}" x1="20%" y1="0%" x2="95%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="45%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="70%" stop-color="#000000" stop-opacity="0.15"/>
        <stop offset="85%" stop-color="#000000" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.50"/>
      </linearGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${visualRadius}" fill="url(#${terminatorId})"/>
  `;
  svgParts.push(terminatorSvg);

  // Layer 5: Ambient occlusion — subtle vignette for 3D depth
  const aoSvg = `
    <defs>
      <radialGradient id="${aoId}" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="65%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="85%" stop-color="#000000" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
      </radialGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${visualRadius}" fill="url(#${aoId})"/>
  `;
  svgParts.push(aoSvg);

  // Layer 6: Specular highlight — bright spot on the lit side
  const specSize = visualRadius * 0.35;
  const specCx = center - visualRadius * 0.28;
  const specCy = center - visualRadius * 0.25;
  const specularSvg = `
    <defs>
      <radialGradient id="${specularId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18"/>
        <stop offset="40%" stop-color="#FFFFFF" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="${specCx}" cy="${specCy}" r="${specSize}" fill="url(#${specularId})"/>
  `;
  svgParts.push(specularSvg);

  // Layer 7: Front rings (in front of planet)
  if (showRings) {
    svgParts.push(buildFrontRings(visualRadius, center, secondaryColor));
  }

  // Assemble final SVG
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}" overflow="visible">${svgParts.join('')}</svg>`;

  // Generate description
  const description = generateDescription(planetType, radiusEarth, equilibriumTempK);

  return {
    svgString,
    primaryColor,
    secondaryColor,
    description,
  };
}

function generateDescription(
  planetType: string,
  radiusEarth: number | null,
  equilibriumTempK: number | null
): string {
  const size = radiusEarth !== null
    ? radiusEarth < 1.5 ? 'pequeño'
    : radiusEarth < 4 ? 'mediano'
    : 'grande'
    : 'de tamaño desconocido';

  const temp = equilibriumTempK !== null
    ? equilibriumTempK < 200 ? 'muy frío'
    : equilibriumTempK < 300 ? 'frío'
    : equilibriumTempK < 400 ? 'templado'
    : equilibriumTempK < 600 ? 'cálido'
    : 'muy caliente'
    : 'de temperatura desconocida';

  const typeNames: Record<string, string> = {
    'rocky-terrestrial': 'planeta rocoso terrestre',
    'super-earth': 'super-Tierra',
    'mini-neptune': 'mini-Neptuno',
    'neptunian': 'planeta tipo Neptuno',
    'jovian': 'gigante gaseoso joviano',
    'hot-jupiter': 'Júpiter caliente',
    'cold-giant': 'gigante frío',
    'unknown': 'planeta de tipo desconocido',
  };

  return `${typeNames[planetType] || 'planeta'} ${size}, ${temp}`;
}

// Re-export types and useful functions
export { getPlanetColors, lightenHex, darkenHex } from './algorithms/color.algorithm';
export { getPlanetVisualRadius, getViewBoxSize } from './algorithms/size.algorithm';
export type { RenderSize } from './algorithms/size.algorithm';

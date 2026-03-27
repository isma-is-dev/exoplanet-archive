import { PlanetRenderOutput, PlanetRenderParams } from '@exodex/shared-types';
import {
  getPlanetColors,
  lightenHex,
  darkenHex,
} from './algorithms/color.algorithm';
import { getPlanetVisualRadius, getViewBoxSize, RenderSize } from './algorithms/size.algorithm';
import { buildAtmosphereGlow } from './algorithms/atmosphere.algorithm';
import { shouldShowRings, buildRings } from './algorithms/rings.algorithm';
import { buildSurfaceDetails } from './algorithms/surface.algorithm';

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
  } = params;

  // Calcular dimensiones
  const viewBoxSize = getViewBoxSize(size);
  const visualRadius = getPlanetVisualRadius(radiusEarth, size);
  const center = viewBoxSize / 2;

  // Obtener colores
  const colors = getPlanetColors(planetType, equilibriumTempK);
  const { primary: primaryColor, secondary: secondaryColor } = colors;

  // Construir gradientes
  const highlightColor = lightenHex(secondaryColor, 0.35);
  const shadowColor = darkenHex(primaryColor, 0.40);
  const gradientId = `body-${Math.random().toString(36).substr(2, 9)}`;

  // Determinar si mostrar anillos
  const showRings = shouldShowRings(planetType, radiusEarth);

  // Generar SVG
  let svgParts: string[] = [];

  // Anillos (detrás del planeta)
  if (showRings) {
    svgParts.push(buildRings(visualRadius, center, secondaryColor));
  }

  // Atmósfera/glow
  const atmosphereSvg = buildAtmosphereGlow(
    visualRadius,
    center,
    primaryColor,
    equilibriumTempK,
    insolationFlux
  );
  if (atmosphereSvg) {
    svgParts.push(atmosphereSvg);
  }

  // Cuerpo del planeta
  const bodySvg = `
    <defs>
      <radialGradient id="${gradientId}" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="${highlightColor}"/>
        <stop offset="45%" stop-color="${primaryColor}"/>
        <stop offset="100%" stop-color="${shadowColor}"/>
      </radialGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${visualRadius}" fill="url(#${gradientId})"/>
  `;
  svgParts.push(bodySvg);

  // Detalles de superficie
  const surfaceSvg = buildSurfaceDetails(
    planetType,
    visualRadius,
    center,
    primaryColor,
    secondaryColor,
    equilibriumTempK,
    planetName
  );
  svgParts.push(surfaceSvg);

  // Unir todo
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">${svgParts.join('')}</svg>`;

  // Generar descripción
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

// Re-exportar tipos y funciones útiles
export { getPlanetColors, lightenHex, darkenHex } from './algorithms/color.algorithm';
export { getPlanetVisualRadius, getViewBoxSize } from './algorithms/size.algorithm';
export type { RenderSize } from './algorithms/size.algorithm';

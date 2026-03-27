import { StarRenderOutput, StarRenderParams } from '@exodex/shared-types';
import { getViewBoxSize } from './algorithms/size.algorithm';
import { getStarColors, getStarVisualRadius } from './algorithms/star.algorithm';
import { lightenHex, darkenHex } from './algorithms/color.algorithm';

export function renderStar(
  params: StarRenderParams,
  starName: string = 'Unknown Star'
): StarRenderOutput {
  const {
    stellarTempK,
    stellarRadiusSun,
    stellarMassSun,
    size,
    animationsEnabled,
  } = params;

  // Calculate dimensions
  const viewBoxSize = getViewBoxSize(size);
  const visualRadius = getStarVisualRadius(stellarRadiusSun, size);
  const center = viewBoxSize / 2;

  // Get colors based on temperature
  const colors = getStarColors(stellarTempK);
  const { primary, secondary, glow, core, spectralClass } = colors;

  // Unique IDs for gradients and filters
  const idSuffix = Math.random().toString(36).substr(2, 6);
  const coreGradId = `star-core-${idSuffix}`;
  const coronaGradId = `star-corona-${idSuffix}`;
  const filterId = `star-turb-${idSuffix}`;
  const flaresGradId = `star-flares-${idSuffix}`;

  let svgParts: string[] = [];
  
  // Complexity of flares depends on the mass/temp (more active for certain stars)
  const isMicro = size === 'micro';

  if (!isMicro) {
    // 1. Outer Corona / Glow (behind the star)
    const coronaSize = visualRadius * 1.6;
    svgParts.push(`
      <defs>
        <radialGradient id="${coronaGradId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${primary}" stop-opacity="0.8" />
          <stop offset="40%" stop-color="${primary}" stop-opacity="0.3" />
          <stop offset="70%" stop-color="${secondary}" stop-opacity="0.1" />
          <stop offset="100%" stop-color="${secondary}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="${center}" cy="${center}" r="${coronaSize}" fill="url(#${coronaGradId})" />
    `);

    // 2. Solar Flares / Turbulent edge (SVG filters)
    const flareSize = visualRadius * 1.08;
    const baseFreq = size === 'detail' ? '0.04' : '0.08';
    
    // In animated mode we add a simple rotating group
    const animateTransform = animationsEnabled
      ? `<animateTransform attributeName="transform" type="rotate" from="0 ${center} ${center}" to="360 ${center} ${center}" dur="40s" repeatCount="indefinite" />`
      : '';

    svgParts.push(`
      <defs>
        <radialGradient id="${flaresGradId}" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stop-color="${primary}" stop-opacity="1" />
          <stop offset="100%" stop-color="${primary}" stop-opacity="0" />
        </radialGradient>
        <filter id="${filterId}" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="3" seed="${stellarTempK || 123}" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 -0.3" in="noise" result="alphaNoise" />
          <feDisplacementMap in="SourceGraphic" in2="alphaNoise" scale="${visualRadius * 0.2}" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter="url(#${filterId})">
        <circle cx="${center}" cy="${center}" r="${flareSize}" fill="url(#${flaresGradId})">
          ${animateTransform}
        </circle>
      </g>
    `);
  }

  // 3. Core of the star
  svgParts.push(`
    <defs>
      <radialGradient id="${coreGradId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${core}" />
        <stop offset="50%" stop-color="${core}" />
        <stop offset="85%" stop-color="${lightenHex(primary, 0.4)}" />
        <stop offset="100%" stop-color="${primary}" />
      </radialGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${visualRadius}" fill="url(#${coreGradId})" />
  `);
  
  if (!isMicro) {
    // 4. Star spots
    const spotsId = `star-spots-${idSuffix}`;
    const rotDur = animationsEnabled ? '60s' : '0s';
    const animateRot = animationsEnabled
      ? `<animateTransform attributeName="transform" type="rotate" from="360 ${center} ${center}" to="0 ${center} ${center}" dur="${rotDur}" repeatCount="indefinite" />`
      : '';

    svgParts.push(`
      <defs>
        <filter id="${spotsId}" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="${(stellarMassSun || 1) * 10}" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.25 0" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
        </filter>
      </defs>
      <g filter="url(#${spotsId})">
        <circle cx="${center}" cy="${center}" r="${visualRadius}" fill="${darkenHex(primary, 0.6)}">
          ${animateRot}
        </circle>
      </g>
    `);
  }

  const numStars = params.numberOfStarsInSystem || 1;
  const extraStarsParts: string[] = [];

  if (numStars > 1 && !isMicro) {
    for (let i = 1; i < numStars; i++) {
      // Companion positions: top-right, bottom-left relative to center
      const angle = i === 1 ? -Math.PI / 4 : (Math.PI * 3) / 4;
      const distance = visualRadius * (1.8 + i * 0.4);
      const cx = center + Math.cos(angle) * distance;
      const cy = center + Math.sin(angle) * distance;
      
      const compVisualRadius = visualRadius * (0.3 + (i * 0.1));
      const compTemp = stellarTempK ? Math.max(2500, stellarTempK * (1 - i * 0.25)) : 3500;
      const compColors = getStarColors(compTemp);
      const compIdSuffix = `${idSuffix}-comp${i}`;
      
      extraStarsParts.push(`
        <defs>
          <radialGradient id="star-corona-${compIdSuffix}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${compColors.primary}" stop-opacity="0.6" />
            <stop offset="60%" stop-color="${compColors.secondary}" stop-opacity="0.1" />
            <stop offset="100%" stop-color="${compColors.secondary}" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${compVisualRadius * 2.5}" fill="url(#star-corona-${compIdSuffix})" />
      `);
      
      const compFlareSize = compVisualRadius * 1.08;
      const compFlaresGradId = `star-flares-${compIdSuffix}`;
      const compFilterId = `star-turb-${compIdSuffix}`;
      const compAnimateTransform = animationsEnabled
        ? `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="50s" repeatCount="indefinite" />`
        : '';
        
      const baseFreq = size === 'detail' ? '0.04' : '0.08';
      
      extraStarsParts.push(`
        <defs>
          <radialGradient id="${compFlaresGradId}" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stop-color="${compColors.primary}" stop-opacity="1" />
            <stop offset="100%" stop-color="${compColors.primary}" stop-opacity="0" />
          </radialGradient>
          <filter id="${compFilterId}" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="3" seed="${(stellarTempK || 123) + i}" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 -0.3" in="noise" result="alphaNoise" />
            <feDisplacementMap in="SourceGraphic" in2="alphaNoise" scale="${compVisualRadius * 0.2}" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#${compFilterId})">
          <circle cx="${cx}" cy="${cy}" r="${compFlareSize}" fill="url(#${compFlaresGradId})">
            ${compAnimateTransform}
          </circle>
        </g>
      `);

      extraStarsParts.push(`
        <defs>
          <radialGradient id="star-core-${compIdSuffix}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="70%" stop-color="${lightenHex(compColors.primary, 0.4)}" />
            <stop offset="100%" stop-color="${compColors.primary}" />
          </radialGradient>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${compVisualRadius}" fill="url(#star-core-${compIdSuffix})" />
      `);
    }
  }

  // Prepend extra stars so they render behind the primary star
  svgParts = [...extraStarsParts, ...svgParts];

  // Assemble final SVG
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}" overflow="visible">${svgParts.join('')}</svg>`;

  return {
    svgString,
    primaryColor: primary,
    spectralClass,
  };
}

import { StarRenderOutput, StarRenderParams } from '@exodex/shared-types';
import { getViewBoxSize } from './algorithms/size.algorithm';
import { getStarColors, getStarVisualRadius } from './algorithms/star.algorithm';
import { lightenHex, darkenHex } from './algorithms/color.algorithm';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Determines animation timing multiplier based on stellar temperature.
 * Hotter stars = more energetic / faster animations.
 * Cooler stars = calmer / slower animations.
 * Values are intentionally slow for a majestic, celestial feel.
 */
function getAnimationTimingFactor(tempK: number | null): number {
  const t = tempK ?? 5778;
  if (t > 25000) return 2.2;   // O — energetic but still slow
  if (t > 10000) return 2.5;   // B — moderate
  if (t > 7500) return 2.8;    // A — calm
  if (t > 6000) return 3.0;    // F — slow
  if (t > 5000) return 3.2;    // G — baseline (Sun) — slow, majestic
  if (t > 3500) return 3.8;    // K — very slow
  return 4.5;                   // M — calm, very slow
}

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

  // Animation timing
  const tf = getAnimationTimingFactor(stellarTempK);

  // Unique IDs for gradients and filters - deterministic based on star name for SSR/hydration compatibility
  const idSuffix = hashString(starName + (stellarTempK || 0)).toString(36);
  const coreGradId = `star-core-${idSuffix}`;
  const coronaGradId = `star-corona-${idSuffix}`;
  const filterId = `star-turb-${idSuffix}`;
  const flaresGradId = `star-flares-${idSuffix}`;

  let svgParts: string[] = [];
  
  // Complexity of flares depends on the mass/temp (more active for certain stars)
  const isMicro = size === 'micro';

  if (!isMicro) {
    // 1. Outer Corona / Glow (behind the star) — with breathing animation
    const coronaSize = visualRadius * 1.6;
    const coronaBreathDur = `${4 * tf}s`;
    const coronaPulseAnim = animationsEnabled ? `
          <animate attributeName="r" values="${coronaSize};${coronaSize * 1.1};${coronaSize}" dur="${coronaBreathDur}" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
          <animate attributeName="opacity" values="1;0.75;1" dur="${coronaBreathDur}" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
    ` : '';

    svgParts.push(`
      <defs>
        <radialGradient id="${coronaGradId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${primary}" stop-opacity="0.8" />
          <stop offset="40%" stop-color="${primary}" stop-opacity="0.3" />
          <stop offset="70%" stop-color="${secondary}" stop-opacity="0.1" />
          <stop offset="100%" stop-color="${secondary}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="${center}" cy="${center}" r="${coronaSize}" fill="url(#${coronaGradId})">
        ${coronaPulseAnim}
      </circle>
    `);

    // 2. Solar Flares / Turbulent edge — with animated turbulence
    const flareSize = visualRadius * 1.08;
    const baseFreq = size === 'detail' ? 0.04 : 0.08;
    const flareTurbDur = `${3 * tf}s`;
    const flareRotDur = `${40 * tf}s`;
    
    // Animate the feTurbulence baseFrequency to create "boiling" effect
    const turbulenceAnimate = animationsEnabled ? `
          <animate attributeName="baseFrequency" values="${baseFreq};${baseFreq * 1.4};${baseFreq * 0.7};${baseFreq}" dur="${flareTurbDur}" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
    ` : '';

    const animateTransform = animationsEnabled
      ? `<animateTransform attributeName="transform" type="rotate" from="0 ${center} ${center}" to="360 ${center} ${center}" dur="${flareRotDur}" repeatCount="indefinite" />`
      : '';

    svgParts.push(`
      <defs>
        <radialGradient id="${flaresGradId}" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stop-color="${primary}" stop-opacity="1" />
          <stop offset="100%" stop-color="${primary}" stop-opacity="0" />
        </radialGradient>
        <filter id="${filterId}" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="3" seed="${stellarTempK || 123}" result="noise">
            ${turbulenceAnimate}
          </feTurbulence>
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

    // 2b. Secondary flare layer for more complex look (only in detail size)
    if (size === 'detail' && animationsEnabled) {
      const flare2Id = `star-flare2-${idSuffix}`;
      const flare2FilterId = `star-turb2-${idSuffix}`;
      const flare2Size = visualRadius * 1.12;
      const baseFreq2 = baseFreq * 0.7;
      const flare2RotDur = `${55 * tf}s`;

      svgParts.push(`
        <defs>
          <radialGradient id="${flare2Id}" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stop-color="${lightenHex(primary, 0.15)}" stop-opacity="0.6" />
            <stop offset="100%" stop-color="${primary}" stop-opacity="0" />
          </radialGradient>
          <filter id="${flare2FilterId}" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency="${baseFreq2}" numOctaves="2" seed="${(stellarTempK || 123) + 50}" result="noise2">
              <animate attributeName="baseFrequency" values="${baseFreq2};${baseFreq2 * 1.5};${baseFreq2 * 0.6};${baseFreq2}" dur="${4.5 * tf}s" repeatCount="indefinite" />
            </feTurbulence>
            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.7 -0.2" in="noise2" result="alphaNoise2" />
            <feDisplacementMap in="SourceGraphic" in2="alphaNoise2" scale="${visualRadius * 0.15}" xChannelSelector="G" yChannelSelector="R" />
          </filter>
        </defs>
        <g filter="url(#${flare2FilterId})">
          <circle cx="${center}" cy="${center}" r="${flare2Size}" fill="url(#${flare2Id})">
            <animateTransform attributeName="transform" type="rotate" from="360 ${center} ${center}" to="0 ${center} ${center}" dur="${flare2RotDur}" repeatCount="indefinite" />
          </circle>
        </g>
      `);
    }
  }

  // 3. Core of the star — with subtle pulsation
  const corePulseDur = `${2.5 * tf}s`;
  const corePulseAnim = animationsEnabled && !isMicro ? `
    <animate attributeName="r" values="${visualRadius};${visualRadius * 1.008};${visualRadius}" dur="${corePulseDur}" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
  ` : '';

  svgParts.push(`
    <defs>
      <radialGradient id="${coreGradId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${core}" />
        <stop offset="50%" stop-color="${core}" />
        <stop offset="85%" stop-color="${lightenHex(primary, 0.4)}" />
        <stop offset="100%" stop-color="${primary}" />
      </radialGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${visualRadius}" fill="url(#${coreGradId})">
      ${corePulseAnim}
    </circle>
  `);
  
  if (!isMicro) {
    // 4. Star spots with animated turbulence
    const spotsId = `star-spots-${idSuffix}`;
    const rotDur = `${60 * tf}s`;
    const spotsFreq = 0.05;
    
    const spotsTurbAnim = animationsEnabled ? `
          <animate attributeName="baseFrequency" values="${spotsFreq};${spotsFreq * 1.3};${spotsFreq * 0.8};${spotsFreq}" dur="${5 * tf}s" repeatCount="indefinite" />
    ` : '';
    
    const animateRot = animationsEnabled
      ? `<animateTransform attributeName="transform" type="rotate" from="360 ${center} ${center}" to="0 ${center} ${center}" dur="${rotDur}" repeatCount="indefinite" />`
      : '';

    svgParts.push(`
      <defs>
        <filter id="${spotsId}" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="${spotsFreq}" numOctaves="4" seed="${(stellarMassSun || 1) * 10}" result="noise">
            ${spotsTurbAnim}
          </feTurbulence>
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
  let extraStarsParts: string[] = [];

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
      const compTf = getAnimationTimingFactor(compTemp);

      // Companion corona with breathing
      const compCoronaSize = compVisualRadius * 2.5;
      const compCoronaBreath = animationsEnabled ? `
        <animate attributeName="r" values="${compCoronaSize};${compCoronaSize * 1.08};${compCoronaSize}" dur="${4.5 * compTf}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
      ` : '';

      extraStarsParts.push(`
        <defs>
          <radialGradient id="star-corona-${compIdSuffix}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${compColors.primary}" stop-opacity="0.6" />
            <stop offset="60%" stop-color="${compColors.secondary}" stop-opacity="0.1" />
            <stop offset="100%" stop-color="${compColors.secondary}" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${compCoronaSize}" fill="url(#star-corona-${compIdSuffix})">
          ${compCoronaBreath}
        </circle>
      `);
      
      const compFlareSize = compVisualRadius * 1.08;
      const compFlaresGradId = `star-flares-${compIdSuffix}`;
      const compFilterId = `star-turb-${compIdSuffix}`;
      const compBaseFreq = size === 'detail' ? 0.04 : 0.08;

      const compTurbAnim = animationsEnabled ? `
            <animate attributeName="baseFrequency" values="${compBaseFreq};${compBaseFreq * 1.3};${compBaseFreq * 0.8};${compBaseFreq}" dur="${3.5 * compTf}s" repeatCount="indefinite" />
      ` : '';
      const compAnimateTransform = animationsEnabled
        ? `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${50 * compTf}s" repeatCount="indefinite" />`
        : '';
        
      extraStarsParts.push(`
        <defs>
          <radialGradient id="${compFlaresGradId}" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stop-color="${compColors.primary}" stop-opacity="1" />
            <stop offset="100%" stop-color="${compColors.primary}" stop-opacity="0" />
          </radialGradient>
          <filter id="${compFilterId}" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="${compBaseFreq}" numOctaves="3" seed="${(stellarTempK || 123) + i}" result="noise">
              ${compTurbAnim}
            </feTurbulence>
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

import { lightenHex, darkenHex } from './color.algorithm';

/**
 * Build a multi-layer atmospheric glow with Fresnel rim lighting.
 * The atmosphere color is inferred from the planet's equilibrium temperature.
 * When animated, adds subtle breathing pulsation to the glow layers.
 */
export function buildAtmosphereGlow(
  radius: number,
  center: number,
  color: string,
  equilibriumTempK: number | null,
  insolationFlux: number | null,
  animate: boolean = false
): string {
  // Only show atmosphere if we have temperature or flux data
  if (insolationFlux === null && equilibriumTempK === null) {
    return '';
  }

  // Determine glow properties based on temperature
  let glowColor = color;
  let glowIntensity = 0.12;
  let rimColor = lightenHex(color, 0.5);
  let rimIntensity = 0.25;

  if (equilibriumTempK !== null) {
    if (equilibriumTempK > 1000) {
      // Ultra-hot: intense orange-red glow
      glowColor = '#FF5020';
      rimColor = '#FFB060';
      glowIntensity = 0.28;
      rimIntensity = 0.45;
    } else if (equilibriumTempK > 700) {
      // Hot: warm orange glow
      glowColor = '#E87040';
      rimColor = '#F0A870';
      glowIntensity = 0.20;
      rimIntensity = 0.35;
    } else if (equilibriumTempK > 400) {
      // Warm: subtle warm tint
      glowColor = '#D8A878';
      rimColor = lightenHex(color, 0.4);
      glowIntensity = 0.14;
      rimIntensity = 0.28;
    } else if (equilibriumTempK < 150) {
      // Very cold: cool blue glow
      glowColor = '#88B8E0';
      rimColor = '#A8D0F0';
      glowIntensity = 0.16;
      rimIntensity = 0.30;
    } else if (equilibriumTempK < 250) {
      // Cold: subtle blue
      glowColor = '#90B4D0';
      rimColor = '#B0CCE0';
      glowIntensity = 0.13;
      rimIntensity = 0.25;
    }
  }

  const idPrefix = `atm-${Math.random().toString(36).substr(2, 9)}`;
  const outerGlowId = `${idPrefix}-outer`;
  const innerGlowId = `${idPrefix}-inner`;
  const rimGradId = `${idPrefix}-rim`;

  const outerRadius = radius * 1.18;
  const innerRadius = radius * 1.08;

  // Animation: subtle atmospheric breathing
  const breathDur = '5s';
  const outerBreathAnim = animate ? `
    <animate attributeName="r" values="${outerRadius};${outerRadius * 1.04};${outerRadius}" dur="${breathDur}" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
    <animate attributeName="opacity" values="1;0.85;1" dur="${breathDur}" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
  ` : '';

  const innerBreathAnim = animate ? `
    <animate attributeName="r" values="${innerRadius};${innerRadius * 1.03};${innerRadius}" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
  ` : '';

  const rimPulseAnim = animate ? `
    <animate attributeName="opacity" values="1;0.8;1" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
  ` : '';

  let svg = `
    <defs>
      <!-- Outer atmospheric glow — large, soft -->
      <radialGradient id="${outerGlowId}" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stop-color="${glowColor}" stop-opacity="0"/>
        <stop offset="80%" stop-color="${glowColor}" stop-opacity="${glowIntensity * 0.3}"/>
        <stop offset="100%" stop-color="${glowColor}" stop-opacity="${glowIntensity}"/>
      </radialGradient>

      <!-- Inner atmospheric glow — tighter -->
      <radialGradient id="${innerGlowId}" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stop-color="${glowColor}" stop-opacity="0"/>
        <stop offset="90%" stop-color="${glowColor}" stop-opacity="${glowIntensity * 0.6}"/>
        <stop offset="100%" stop-color="${glowColor}" stop-opacity="${glowIntensity * 1.2}"/>
      </radialGradient>

      <!-- Fresnel rim gradient — brighter on the lit side -->
      <radialGradient id="${rimGradId}" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="${rimColor}" stop-opacity="0"/>
        <stop offset="75%" stop-color="${rimColor}" stop-opacity="0"/>
        <stop offset="88%" stop-color="${rimColor}" stop-opacity="${rimIntensity * 0.5}"/>
        <stop offset="100%" stop-color="${rimColor}" stop-opacity="${rimIntensity}"/>
      </radialGradient>
    </defs>

    <!-- Outer glow layer -->
    <circle cx="${center}" cy="${center}" r="${outerRadius}" fill="url(#${outerGlowId})">
      ${outerBreathAnim}
    </circle>

    <!-- Inner glow layer -->
    <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="url(#${innerGlowId})">
      ${innerBreathAnim}
    </circle>

    <!-- Fresnel rim lighting -->
    <circle cx="${center}" cy="${center}" r="${radius * 1.01}" fill="url(#${rimGradId})">
      ${rimPulseAnim}
    </circle>
  `;

  return svg;
}

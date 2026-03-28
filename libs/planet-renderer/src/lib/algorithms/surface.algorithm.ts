import { PlanetType } from '@exodex/shared-types';
import { darkenHex, lightenHex, mixHex } from './color.algorithm';

// ─── Seeded random ────────────────────────────────────────────

export function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return function() {
    hash = ((hash * 1664525) + 1013904223) & 0xffffffff;
    return (hash >>> 0) / 0xffffffff;
  };
}

/** Convert planet name to a stable integer seed for feTurbulence */
function nameToSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h) + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 100000;
}

// ─── Unique ID helper ─────────────────────────────────────────

let _idCounter = 0;
function uid(prefix: string): string {
  return `${prefix}-${_idCounter++}-${Math.random().toString(36).substr(2, 5)}`;
}

// ─── Rotation speed from orbital period ───────────────────────

/**
 * Derives a visual rotation duration (in seconds) from orbital period.
 * Shorter orbital period → faster visual rotation (more dynamic).
 * Uses logarithmic mapping clamped to pleasant visual range.
 *
 * The relationship is loosely inspired by real physics:
 * - Hot Jupiters (P < 3 days) are often tidally locked but have violent atmospheres
 * - Gas giants generally rotate fastest
 * - Rocky planets with longer periods rotate slower
 */
function getRotationDuration(
  orbitalPeriodDays: number | null,
  planetType: PlanetType
): number {
  // Base durations by planet type (fallback when no orbital period)
  const baseDurations: Record<string, number> = {
    'jovian': 22,
    'hot-jupiter': 18,
    'cold-giant': 28,
    'neptunian': 32,
    'mini-neptune': 35,
    'super-earth': 48,
    'rocky-terrestrial': 55,
    'unknown': 40,
  };

  const baseDur = baseDurations[planetType] ?? 40;

  if (orbitalPeriodDays === null || orbitalPeriodDays <= 0) {
    return baseDur;
  }

  // Logarithmic mapping: orbitalPeriodDays → rotation duration
  // P=0.5 days → ~15s, P=5 → ~25s, P=50 → ~40s, P=500 → ~55s, P=5000 → ~70s
  const logP = Math.log10(Math.max(0.1, orbitalPeriodDays));
  // logP ranges from ~-1 to ~4, map to 12–70s
  const mapped = 12 + (logP + 1) * 11.6; // -1→12, 0→23.6, 1→35.2, 2→46.8, 3→58.4, 4→70
  return Math.max(12, Math.min(70, mapped));
}

// ─── Main entry ───────────────────────────────────────────────

export function buildSurfaceDetails(
  planetType: PlanetType,
  radius: number,
  center: number,
  primaryColor: string,
  secondaryColor: string,
  equilibriumTempK: number | null,
  planetName: string,
  tertiaryColor: string = '#888888',
  accentColor: string = '#555555',
  animate: boolean = false,
  orbitalPeriodDays: number | null = null
): string {
  const rand = seededRandom(planetName || 'unknown');
  const seed = nameToSeed(planetName || 'unknown');
  const clipId = uid('surf-clip');
  const rotDur = getRotationDuration(orbitalPeriodDays, planetType);

  // All surface detail is clipped to the planet circle
  let svg = `<defs><clipPath id="${clipId}"><circle cx="${center}" cy="${center}" r="${radius}"/></clipPath></defs>`;
  svg += `<g clip-path="url(#${clipId})">`;

  if (planetType === 'rocky-terrestrial' || planetType === 'super-earth') {
    svg += buildRockySurface(radius, center, primaryColor, secondaryColor, tertiaryColor, accentColor, rand, seed, equilibriumTempK, planetType, animate, rotDur);
  } else if (planetType === 'mini-neptune' || planetType === 'neptunian') {
    svg += buildGaseousSurface(radius, center, primaryColor, secondaryColor, tertiaryColor, accentColor, rand, seed, false, animate, rotDur);
  } else if (planetType === 'jovian' || planetType === 'hot-jupiter') {
    svg += buildGaseousSurface(radius, center, primaryColor, secondaryColor, tertiaryColor, accentColor, rand, seed, true, animate, rotDur);
  } else if (planetType === 'cold-giant') {
    svg += buildGaseousSurface(radius, center, primaryColor, secondaryColor, tertiaryColor, accentColor, rand, seed, false, animate, rotDur);
  }

  svg += '</g>';
  return svg;
}

// ─── Rocky / Terrestrial surfaces ─────────────────────────────

function buildRockySurface(
  radius: number,
  center: number,
  primary: string,
  secondary: string,
  tertiary: string,
  accent: string,
  rand: () => number,
  seed: number,
  tempK: number | null,
  planetType: PlanetType,
  animate: boolean,
  rotDur: number
): string {
  let svg = '';

  // Wrap all surface features in a group for rotation animation
  const rotGroupId = uid('rot-group');
  // For rocky surfaces, we animate horizontal translation to simulate rotation
  // The trick: we create a wider surface area and translate it inside the clip
  const surfaceWidth = radius * 2;
  const translateAmount = radius * 0.3; // How far the texture travels

  const rotAnim = animate ? `
    <animateTransform attributeName="transform" type="translate"
      values="0,0;${translateAmount},0;0,0;${-translateAmount},0;0,0"
      dur="${rotDur}s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
  ` : '';

  svg += `<g>`;
  if (animate) {
    svg += `<g>${rotAnim}`;
  }

  // 1. Base fractal terrain texture using feTurbulence
  const terrainFilterId = uid('terrain');
  const baseFreq = 0.008 + rand() * 0.006;
  const octaves = 4 + Math.floor(rand() * 3);

  svg += `
    <defs>
      <filter id="${terrainFilterId}" x="-20%" y="0" width="140%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="${octaves}" seed="${seed}" result="noise"/>
        <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
        <feComponentTransfer in="grayNoise" result="contrast">
          <feFuncR type="linear" slope="1.8" intercept="-0.3"/>
          <feFuncG type="linear" slope="1.8" intercept="-0.3"/>
          <feFuncB type="linear" slope="1.8" intercept="-0.3"/>
        </feComponentTransfer>
      </filter>
    </defs>
  `;

  // Base terrain layer — blended with planet color
  svg += `<rect x="${center - radius - translateAmount}" y="${center - radius}" width="${radius * 2 + translateAmount * 2}" height="${radius * 2}" fill="${secondary}" filter="url(#${terrainFilterId})" opacity="0.55"/>`;

  // 2. Larger-scale continent/region shapes using lower-frequency turbulence
  const continentFilterId = uid('continent');
  const contFreq = 0.003 + rand() * 0.003;

  svg += `
    <defs>
      <filter id="${continentFilterId}" x="-20%" y="0" width="140%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${contFreq}" numOctaves="3" seed="${seed + 42}" result="contNoise"/>
        <feColorMatrix type="saturate" values="0" in="contNoise" result="contGray"/>
        <feComponentTransfer in="contGray" result="contContrast">
          <feFuncR type="discrete" tableValues="0 0 0.4 0.8 1 1"/>
          <feFuncG type="discrete" tableValues="0 0 0.4 0.8 1 1"/>
          <feFuncB type="discrete" tableValues="0 0 0.4 0.8 1 1"/>
        </feComponentTransfer>
      </filter>
    </defs>
  `;

  svg += `<rect x="${center - radius - translateAmount}" y="${center - radius}" width="${radius * 2 + translateAmount * 2}" height="${radius * 2}" fill="${tertiary}" filter="url(#${continentFilterId})" opacity="0.40"/>`;

  // 3. Craters for small/rocky planets
  if (planetType === 'rocky-terrestrial' || (tempK !== null && tempK > 400)) {
    svg += buildCraters(radius, center, accent, rand);
  }

  // 4. Polar caps for cold planets
  if (tempK !== null && tempK < 280) {
    svg += buildPolarCaps(radius, center, tempK, rand);
  }

  if (animate) {
    svg += `</g>`; // close rotation group
  }

  // 5. Cloud layer for temperate super-earths (animated independently — faster than surface)
  if (planetType === 'super-earth' && tempK !== null && tempK >= 200 && tempK <= 400) {
    svg += buildCloudLayer(radius, center, rand, seed, animate, rotDur);
  }

  svg += `</g>`;
  return svg;
}

function buildCraters(
  radius: number,
  center: number,
  accentColor: string,
  rand: () => number
): string {
  const numCraters = 4 + Math.floor(rand() * 6);
  let svg = '';

  for (let i = 0; i < numCraters; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = rand() * radius * 0.75;
    const cx = center + Math.cos(angle) * dist;
    const cy = center + Math.sin(angle) * dist;
    const cr = radius * (0.03 + rand() * 0.08);
    const rimId = uid('crater');

    // Crater with subtle gradient — darker center, lighter rim
    svg += `
      <defs>
        <radialGradient id="${rimId}" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="${darkenHex(accentColor, 0.3)}" stop-opacity="0.5"/>
          <stop offset="60%" stop-color="${accentColor}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${lightenHex(accentColor, 0.2)}" stop-opacity="0.1"/>
        </radialGradient>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="${cr}" fill="url(#${rimId})"/>
    `;
  }

  return svg;
}

function buildPolarCaps(
  radius: number,
  center: number,
  tempK: number,
  rand: () => number
): string {
  // More prominent caps for colder temperatures
  const capFactor = Math.min(0.6, Math.max(0.2, (280 - tempK) / 200));
  const capGradId = uid('polarcap');
  const capGradId2 = uid('polarcap-s');
  let svg = '';

  // North pole
  const northCy = center - radius * (0.55 + rand() * 0.15);
  const capRx = radius * (0.3 + capFactor * 0.3);
  const capRy = capRx * 0.45;

  svg += `
    <defs>
      <radialGradient id="${capGradId}" cx="50%" cy="60%" r="50%">
        <stop offset="0%" stop-color="#E8EEF2" stop-opacity="${0.4 + capFactor * 0.3}"/>
        <stop offset="70%" stop-color="#C8D8E4" stop-opacity="${0.2 + capFactor * 0.15}"/>
        <stop offset="100%" stop-color="#A0B8C8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="${center}" cy="${northCy}" rx="${capRx}" ry="${capRy}" fill="url(#${capGradId})"/>
  `;

  // South pole (smaller)
  if (capFactor > 0.3) {
    const southCy = center + radius * (0.55 + rand() * 0.15);
    const sCapRx = capRx * 0.7;
    const sCapRy = capRy * 0.7;
    svg += `
      <defs>
        <radialGradient id="${capGradId2}" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#E8EEF2" stop-opacity="${0.3 + capFactor * 0.2}"/>
          <stop offset="100%" stop-color="#A0B8C8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${center}" cy="${southCy}" rx="${sCapRx}" ry="${sCapRy}" fill="url(#${capGradId2})"/>
    `;
  }

  return svg;
}

function buildCloudLayer(
  radius: number,
  center: number,
  rand: () => number,
  seed: number,
  animate: boolean = false,
  surfaceRotDur: number = 50
): string {
  const cloudFilterId = uid('clouds');
  const freq = 0.006 + rand() * 0.004;

  // Clouds move ~25% faster than the surface (wind speed > rotation speed)
  const cloudDur = surfaceRotDur * 0.75;
  const cloudTranslate = radius * 0.4;

  const cloudAnim = animate ? `
    <animateTransform attributeName="transform" type="translate"
      values="0,0;${cloudTranslate},0;0,0;${-cloudTranslate},0;0,0"
      dur="${cloudDur}s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
  ` : '';

  return `
    <defs>
      <filter id="${cloudFilterId}" x="-30%" y="0" width="160%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${freq} ${freq * 0.6}" numOctaves="4" seed="${seed + 99}" result="cloudNoise"/>
        <feColorMatrix type="saturate" values="0" in="cloudNoise" result="cloudGray"/>
        <feComponentTransfer in="cloudGray" result="cloudThreshold">
          <feFuncA type="linear" slope="3" intercept="-1.2"/>
        </feComponentTransfer>
      </filter>
    </defs>
    <g>
      <rect x="${center - radius - cloudTranslate}" y="${center - radius}" width="${radius * 2 + cloudTranslate * 2}" height="${radius * 2}" fill="#FFFFFF" filter="url(#${cloudFilterId})" opacity="0.35">
        ${cloudAnim}
      </rect>
    </g>
  `;
}

// ─── Gas Giant surfaces ───────────────────────────────────────

function buildGaseousSurface(
  radius: number,
  center: number,
  primary: string,
  secondary: string,
  tertiary: string,
  accent: string,
  rand: () => number,
  seed: number,
  isJovian: boolean,
  animate: boolean = false,
  rotDur: number = 30
): string {
  let svg = '';

  // 1. Turbulent band distortion filter
  const distortFilterId = uid('gasdist');
  const distFreqX = 0.003 + rand() * 0.004;
  const distFreqY = 0.012 + rand() * 0.008;

  // Animate distortion turbulence for a "flowing" effect
  const distortAnim = animate ? `
    <animate attributeName="baseFrequency" 
      values="${distFreqX} ${distFreqY};${distFreqX * 1.2} ${distFreqY * 0.9};${distFreqX * 0.9} ${distFreqY * 1.1};${distFreqX} ${distFreqY}" 
      dur="${rotDur * 0.8}s" repeatCount="indefinite" />
  ` : '';

  svg += `
    <defs>
      <filter id="${distortFilterId}" x="-10%" y="-10%" width="120%" height="120%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feTurbulence type="turbulence" baseFrequency="${distFreqX} ${distFreqY}" numOctaves="4" seed="${seed}" result="turbulence">
          ${distortAnim}
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="${radius * 0.15}" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  `;

  // 2. Generate organic bands with varying widths and colors
  const numBands = isJovian ? (6 + Math.floor(rand() * 4)) : (4 + Math.floor(rand() * 3));
  const bandColors = [primary, secondary, tertiary, accent, mixHex(primary, secondary, 0.5)];

  let bandsGroup = `<g filter="url(#${distortFilterId})">`;
  const totalHeight = radius * 2.4; // Slightly taller to account for distortion
  const startY = center - totalHeight / 2;
  let currentY = startY;

  for (let i = 0; i < numBands; i++) {
    const bandHeight = (totalHeight / numBands) * (0.7 + rand() * 0.6);
    const color = bandColors[i % bandColors.length];
    const opacity = isJovian ? (0.25 + rand() * 0.25) : (0.18 + rand() * 0.18);

    // Each band drifts horizontally at different speeds (jet streams!)
    // Alternate bands move in opposite directions like Jupiter's atmosphere
    const bandDrift = radius * (0.08 + rand() * 0.12);
    const direction = i % 2 === 0 ? 1 : -1;
    const bandDur = rotDur * (0.6 + rand() * 0.8);

    const bandAnim = animate ? `
      <animateTransform attributeName="transform" type="translate"
        values="0,0;${bandDrift * direction},0;0,0;${-bandDrift * direction},0;0,0"
        dur="${bandDur}s" repeatCount="indefinite"
        calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1" />
    ` : '';

    bandsGroup += `<rect x="${center - radius * 1.2 - bandDrift}" y="${currentY}" width="${radius * 2.4 + bandDrift * 2}" height="${bandHeight}" fill="${color}" opacity="${opacity}">
      ${bandAnim}
    </rect>`;

    // Thin accent line between bands
    if (i < numBands - 1 && rand() > 0.4) {
      const lineColor = rand() > 0.5 ? lightenHex(color, 0.3) : darkenHex(color, 0.2);
      bandsGroup += `<rect x="${center - radius * 1.2 - bandDrift}" y="${currentY + bandHeight}" width="${radius * 2.4 + bandDrift * 2}" height="${bandHeight * 0.08}" fill="${lineColor}" opacity="${0.2 + rand() * 0.15}">
        ${bandAnim}
      </rect>`;
    }

    currentY += bandHeight;
  }
  bandsGroup += '</g>';
  svg += bandsGroup;

  // 3. Overlay turbulent detail texture
  const detailFilterId = uid('gasdetail');
  const detailFreq = isJovian ? 0.01 : 0.015;

  svg += `
    <defs>
      <filter id="${detailFilterId}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${detailFreq}" numOctaves="5" seed="${seed + 7}" result="detail"/>
        <feColorMatrix type="saturate" values="0" in="detail" result="detailGray"/>
        <feComponentTransfer in="detailGray">
          <feFuncR type="linear" slope="1.5" intercept="-0.2"/>
          <feFuncG type="linear" slope="1.5" intercept="-0.2"/>
          <feFuncB type="linear" slope="1.5" intercept="-0.2"/>
        </feComponentTransfer>
      </filter>
    </defs>
    <rect x="${center - radius}" y="${center - radius}" width="${radius * 2}" height="${radius * 2}" fill="${secondary}" filter="url(#${detailFilterId})" opacity="0.20"/>
  `;

  // 4. Great spot for jovian planets
  if (isJovian && rand() > 0.3) {
    svg += buildGreatSpot(radius, center, primary, secondary, accent, rand, seed, animate, rotDur);
  }

  return svg;
}

function buildGreatSpot(
  radius: number,
  center: number,
  primary: string,
  secondary: string,
  accent: string,
  rand: () => number,
  seed: number,
  animate: boolean = false,
  rotDur: number = 30
): string {
  const spotX = center + radius * (0.1 + rand() * 0.3);
  const spotY = center + radius * (-0.1 + rand() * 0.3);
  const spotRx = radius * (0.12 + rand() * 0.12);
  const spotRy = spotRx * (0.6 + rand() * 0.2);
  const spotGradId = uid('gspot');
  const spotFilterId = uid('gspotf');
  const spotColor = mixHex(accent, darkenHex(primary, 0.2), 0.5);

  // Great spot drifts with the atmosphere
  const spotDrift = radius * 0.15;
  const spotAnim = animate ? `
    <animateTransform attributeName="transform" type="translate"
      values="0,0;${spotDrift},0;0,0;${-spotDrift},0;0,0"
      dur="${rotDur * 0.9}s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1" />
  ` : '';

  return `
    <defs>
      <radialGradient id="${spotGradId}" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stop-color="${lightenHex(spotColor, 0.15)}"/>
        <stop offset="50%" stop-color="${spotColor}"/>
        <stop offset="100%" stop-color="${darkenHex(spotColor, 0.3)}" stop-opacity="0.4"/>
      </radialGradient>
      <filter id="${spotFilterId}" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" seed="${seed + 13}" result="spotTurb"/>
        <feDisplacementMap in="SourceGraphic" in2="spotTurb" scale="${spotRx * 0.25}" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
    <g>
      <ellipse cx="${spotX}" cy="${spotY}" rx="${spotRx}" ry="${spotRy}" fill="url(#${spotGradId})" filter="url(#${spotFilterId})" opacity="0.65">
        ${spotAnim}
      </ellipse>
    </g>
  `;
}

import { PlanetType } from '@exodex/shared-types';
import { darkenHex, lightenHex, mixHex } from './color.algorithm';

// ─── Seeded random ────────────────────────────────────────────

export function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = ((hash * 1664525) + 1013904223) & 0xffffffff;
    return (hash >>> 0) / 0xffffffff;
  };
}

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

function getRotationDuration(
  orbitalPeriodDays: number | null,
  planetType: PlanetType
): number {
  const baseDurations: Record<string, number> = {
    'jovian': 22, 'hot-jupiter': 18, 'cold-giant': 28,
    'neptunian': 32, 'mini-neptune': 35,
    'super-earth': 48, 'rocky-terrestrial': 55, 'unknown': 40,
  };
  const baseDur = baseDurations[planetType] ?? 40;
  if (orbitalPeriodDays === null || orbitalPeriodDays <= 0) return baseDur;

  const logP = Math.log10(Math.max(0.1, orbitalPeriodDays));
  const mapped = 12 + (logP + 1) * 11.6;
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

  // ── Surface scrolling setup ──
  // We create texture rects wider than the clip circle, then translate them
  // back-and-forth (ping-pong) with smooth easing. This eliminates the hard
  // snap-back that occurs with one-direction translate.
  // With filterUnits="objectBoundingBox", the feTurbulence noise moves WITH the rect.
  const scrollDist = radius * 1.5; // how far to scroll each way
  const rectWidth = radius * 6; // 3x diameter — plenty of margin
  const rectX = center - rectWidth / 2; // centered start position
  const rectY = center - radius;
  const rectHeight = radius * 2;
  // Scale baseFrequency to compensate for wider rect (objectBoundingBox scales freq to bbox)
  const freqScale = rectWidth / (radius * 2); // ≈ 3

  // Ping-pong animation: go right → return left, smooth easing, NO hard cut
  const pingPongDur = rotDur * 2; // doubled since it covers the distance twice
  const scrollAnim = animate ? `
    <animateTransform attributeName="transform" type="translate"
      values="${-scrollDist / 2} 0; ${scrollDist / 2} 0; ${-scrollDist / 2} 0"
      dur="${pingPongDur}s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
  ` : '';

  // Open scrolling group for terrain
  svg += `<g>${scrollAnim}`;

  // 1. Base fractal terrain texture
  const terrainFilterId = uid('terrain');
  const baseFreq = (0.008 + rand() * 0.006) * freqScale;
  const octaves = 4 + Math.floor(rand() * 3);

  svg += `
    <defs>
      <filter id="${terrainFilterId}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
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
  svg += `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${secondary}" filter="url(#${terrainFilterId})" opacity="0.55"/>`;

  // 2. Continent shapes — lower frequency
  const continentFilterId = uid('continent');
  const contFreq = (0.003 + rand() * 0.003) * freqScale;

  svg += `
    <defs>
      <filter id="${continentFilterId}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
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
  svg += `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${tertiary}" filter="url(#${continentFilterId})" opacity="0.40"/>`;

  // 3. Craters (these scroll with the terrain)
  if (planetType === 'rocky-terrestrial' || (tempK !== null && tempK > 400)) {
    svg += buildCraters(radius, center, accent, rand);
  }

  // 4. Polar caps (scroll with terrain)
  if (tempK !== null && tempK < 280) {
    svg += buildPolarCaps(radius, center, tempK, rand);
  }

  // Close terrain scroll group
  svg += `</g>`;

  // 5. Cloud layer — scrolls FASTER than terrain (separate group, separate speed)
  if (planetType === 'super-earth' && tempK !== null && tempK >= 200 && tempK <= 400) {
    svg += buildCloudLayer(radius, center, rand, seed, animate, rotDur);
  }

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
  const capFactor = Math.min(0.6, Math.max(0.2, (280 - tempK) / 200));
  const capGradId = uid('polarcap');
  const capGradId2 = uid('polarcap-s');
  let svg = '';

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

  // Clouds scroll ~30% faster than the surface → visible relative motion
  const cloudPingPongDur = surfaceRotDur * 1.4; // faster than terrain ping-pong
  const scrollDist = radius * 1.5;
  const rectWidth = radius * 6;
  const rectX = center - rectWidth / 2;
  const freqScale = rectWidth / (radius * 2);

  // Clouds ping-pong slightly offset from terrain → relative motion
  const cloudScrollAnim = animate ? `
    <animateTransform attributeName="transform" type="translate"
      values="${scrollDist / 2} 0; ${-scrollDist / 2} 0; ${scrollDist / 2} 0"
      dur="${cloudPingPongDur}s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
  ` : '';

  return `
    <defs>
      <filter id="${cloudFilterId}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${freq * freqScale} ${freq * 0.6 * freqScale}" numOctaves="4" seed="${seed + 99}" result="cloudNoise"/>
        <feColorMatrix type="saturate" values="0" in="cloudNoise" result="cloudGray"/>
        <feComponentTransfer in="cloudGray" result="cloudThreshold">
          <feFuncA type="linear" slope="3" intercept="-1.2"/>
        </feComponentTransfer>
      </filter>
    </defs>
    <g>${cloudScrollAnim}
      <rect x="${rectX}" y="${center - radius}" width="${rectWidth}" height="${radius * 2}" fill="#FFFFFF" filter="url(#${cloudFilterId})" opacity="0.35"/>
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

  // ── Setup ──
  // Gas giant bands are uniform-colored horizontal stripes.
  // Ping-pong translate: go right → return left with smooth easing.
  // Since bands are uniform color, the back-and-forth is seamless.
  // The displacement filter in userSpaceOnUse creates a FIXED distortion
  // field — bands slide through it, getting distorted differently → organic flow.

  const scrollDist = radius * 1.5;
  const bandRectWidth = radius * 6;
  const bandRectX = center - bandRectWidth / 2;

  // 1. Turbulent displacement filter (fixed in space)
  const distortFilterId = uid('gasdist');
  const distFreqX = 0.003 + rand() * 0.004;
  const distFreqY = 0.012 + rand() * 0.008;
  const filterPad = radius * 4;

  svg += `
    <defs>
      <filter id="${distortFilterId}"
        filterUnits="userSpaceOnUse"
        x="${center - filterPad}" y="${center - radius * 1.5}"
        width="${filterPad * 2}" height="${radius * 3}">
        <feTurbulence type="turbulence" baseFrequency="${distFreqX} ${distFreqY}" numOctaves="4" seed="${seed}" result="turbulence"/>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="${radius * 0.15}" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  `;

  // 2. Generate the band layers
  const numBands = isJovian ? (6 + Math.floor(rand() * 4)) : (4 + Math.floor(rand() * 3));
  const bandColors = [primary, secondary, tertiary, accent, mixHex(primary, secondary, 0.5)];

  const totalHeight = radius * 2.4;
  const startY = center - totalHeight / 2;
  let currentY = startY;

  let bandsGroup = `<g filter="url(#${distortFilterId})">`;

  for (let i = 0; i < numBands; i++) {
    const bandHeight = (totalHeight / numBands) * (0.7 + rand() * 0.6);
    const color = bandColors[i % bandColors.length];
    const opacity = isJovian ? (0.25 + rand() * 0.25) : (0.18 + rand() * 0.18);

    // Ping-pong per band: different direction + speed = jet streams
    const direction = i % 2 === 0 ? 1 : -1;
    const bandPingPongDur = rotDur * 2 * (0.7 + rand() * 0.6);
    const half = scrollDist * direction;

    const bandAnim = animate ? `
      <animateTransform attributeName="transform" type="translate"
        values="${-half / 2} 0; ${half / 2} 0; ${-half / 2} 0"
        dur="${bandPingPongDur}s" repeatCount="indefinite"
        calcMode="spline" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
    ` : '';

    bandsGroup += `
      <rect x="${bandRectX}" y="${currentY}" width="${bandRectWidth}" height="${bandHeight}" fill="${color}" opacity="${opacity}">
        ${bandAnim}
      </rect>`;

    if (i < numBands - 1 && rand() > 0.4) {
      const lineColor = rand() > 0.5 ? lightenHex(color, 0.3) : darkenHex(color, 0.2);
      bandsGroup += `
        <rect x="${bandRectX}" y="${currentY + bandHeight}" width="${bandRectWidth}" height="${bandHeight * 0.08}" fill="${lineColor}" opacity="${0.2 + rand() * 0.15}">
          ${bandAnim}
        </rect>`;
    }

    currentY += bandHeight;
  }
  bandsGroup += '</g>';
  svg += bandsGroup;

  // 3. Overlay turbulent detail texture (scrolls as a whole)
  const detailFilterId = uid('gasdetail');
  const detailFreq = isJovian ? 0.01 : 0.015;
  const detailFreqScaled = detailFreq * (bandRectWidth / (radius * 2));

  const detailDist = scrollDist * 0.8;
  const detailScrollAnim = animate ? `
    <animateTransform attributeName="transform" type="translate"
      values="${-detailDist / 2} 0; ${detailDist / 2} 0; ${-detailDist / 2} 0"
      dur="${rotDur * 2.4}s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
  ` : '';

  svg += `
    <defs>
      <filter id="${detailFilterId}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${detailFreqScaled}" numOctaves="5" seed="${seed + 7}" result="detail"/>
        <feColorMatrix type="saturate" values="0" in="detail" result="detailGray"/>
        <feComponentTransfer in="detailGray">
          <feFuncR type="linear" slope="1.5" intercept="-0.2"/>
          <feFuncG type="linear" slope="1.5" intercept="-0.2"/>
          <feFuncB type="linear" slope="1.5" intercept="-0.2"/>
        </feComponentTransfer>
      </filter>
    </defs>
    <g>${detailScrollAnim}
      <rect x="${bandRectX}" y="${center - radius}" width="${bandRectWidth}" height="${radius * 2}" fill="${secondary}" filter="url(#${detailFilterId})" opacity="0.20"/>
    </g>
  `;

  // 4. Upper atmosphere cloud wisps (different ping-pong phase → differential rotation)
  if (animate) {
    const upperPingPongDur = rotDur * 1.3;
    const upperFilterId = uid('upperatm');
    const upperFreq = (0.008 + rand() * 0.006) * (bandRectWidth / (radius * 2));
    const upperDist = scrollDist * 0.6;

    svg += `
      <defs>
        <filter id="${upperFilterId}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="${upperFreq} ${upperFreq * 0.5}" numOctaves="3" seed="${seed + 200}" result="upperNoise"/>
          <feColorMatrix type="saturate" values="0" in="upperNoise" result="upperGray"/>
          <feComponentTransfer in="upperGray" result="upperThresh">
            <feFuncA type="linear" slope="2.5" intercept="-1.0"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="${upperDist / 2} 0; ${-upperDist / 2} 0; ${upperDist / 2} 0"
          dur="${upperPingPongDur}s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
        <rect x="${bandRectX}" y="${center - radius}" width="${bandRectWidth}" height="${radius * 2}" fill="${lightenHex(primary, 0.3)}" filter="url(#${upperFilterId})" opacity="0.15"/>
      </g>
    `;
  }

  // 5. Great spot for jovian planets
  if (isJovian && rand() > 0.3) {
    svg += buildGreatSpot(radius, center, primary, secondary, accent, rand, seed, animate, rotDur, scrollDist);
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
  rotDur: number = 30,
  scrollDist: number = 0
): string {
  const spotX = center + radius * (0.1 + rand() * 0.3);
  const spotY = center + radius * (-0.1 + rand() * 0.3);
  const spotRx = radius * (0.12 + rand() * 0.12);
  const spotRy = spotRx * (0.6 + rand() * 0.2);
  const spotGradId = uid('gspot');
  const spotFilterId = uid('gspotf');
  const spotColor = mixHex(accent, darkenHex(primary, 0.2), 0.5);

  // Great spot ping-pongs with the main atmospheric flow
  const half = scrollDist / 2;
  const spotAnim = animate ? `
    <animateTransform attributeName="transform" type="translate"
      values="${-half} 0; ${half} 0; ${-half} 0"
      dur="${rotDur * 2}s" repeatCount="indefinite"
      calcMode="spline" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
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
    <g>${spotAnim}
      <ellipse cx="${spotX}" cy="${spotY}" rx="${spotRx}" ry="${spotRy}" fill="url(#${spotGradId})" filter="url(#${spotFilterId})" opacity="0.65"/>
    </g>
  `;
}

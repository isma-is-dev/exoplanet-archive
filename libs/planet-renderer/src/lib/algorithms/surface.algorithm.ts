import { PlanetType } from '@exodex/shared-types';

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

export function buildSurfaceDetails(
  planetType: PlanetType,
  radius: number,
  center: number,
  primaryColor: string,
  secondaryColor: string,
  equilibriumTempK: number | null,
  planetName: string
): string {
  const rand = seededRandom(planetName || 'unknown');

  let details = '';

  if (planetType === 'rocky-terrestrial' || planetType === 'super-earth') {
    details += buildRockySurface(radius, center, primaryColor, rand);

    // Capa polar para planetas fríos
    if (equilibriumTempK !== null && equilibriumTempK < 250) {
      details += buildPolarCap(radius, center);
    }
  } else if (planetType === 'mini-neptune' || planetType === 'neptunian') {
    details += buildBandedSurface(radius, center, primaryColor, secondaryColor, rand, false);
  } else if (planetType === 'jovian' || planetType === 'hot-jupiter') {
    details += buildBandedSurface(radius, center, primaryColor, secondaryColor, rand, true);
  } else if (planetType === 'cold-giant') {
    details += buildBandedSurface(radius, center, primaryColor, secondaryColor, rand, false);
  }

  return details;
}

function buildRockySurface(
  radius: number,
  center: number,
  color: string,
  rand: () => number
): string {
  const numSpots = 3 + Math.floor(rand() * 4); // 3-6 manchas
  let spots = '';

  for (let i = 0; i < numSpots; i++) {
    const angle = rand() * Math.PI * 2;
    const distance = rand() * radius * 0.7;
    const cx = center + Math.cos(angle) * distance;
    const cy = center + Math.sin(angle) * distance;
    const rx = radius * (0.15 + rand() * 0.25);
    const ry = radius * (0.1 + rand() * 0.2);
    const rotation = rand() * 360;
    const opacity = 0.08 + rand() * 0.1;

    spots += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000000" opacity="${opacity}" transform="rotate(${rotation} ${cx} ${cy})"/>`;
  }

  return spots;
}

function buildPolarCap(
  radius: number,
  center: number
): string {
  const capRadius = radius * 0.4;
  const cy = center - radius * 0.5;

  return `<ellipse cx="${center}" cy="${cy}" rx="${capRadius}" ry="${capRadius * 0.5}" fill="#FFFFFF" opacity="0.25"/>`;
}

function buildBandedSurface(
  radius: number,
  center: number,
  primaryColor: string,
  secondaryColor: string,
  rand: () => number,
  isJovian: boolean
): string {
  const numBands = 4 + Math.floor(rand() * 4); // 4-7 bandas
  const clipId = `band-clip-${Math.random().toString(36).substr(2, 9)}`;

  let bands = `
    <defs>
      <clipPath id="${clipId}">
        <circle cx="${center}" cy="${center}" r="${radius}"/>
      </clipPath>
    </defs>
    <g clip-path="url(#${clipId})">
  `;

  const bandHeight = (radius * 2) / numBands;

  for (let i = 0; i < numBands; i++) {
    const isProminent = isJovian && i === Math.floor(numBands / 2);
    const color = i % 2 === 0 ? secondaryColor : '#000000';
    const opacity = isProminent ? 0.30 : (0.12 + rand() * 0.08);
    const y = center - radius + i * bandHeight;

    bands += `<rect x="${center - radius}" y="${y}" width="${radius * 2}" height="${bandHeight}" fill="${color}" opacity="${opacity}"/>`;
  }

  // Gran mancha para jovianos masivos (opcional)
  if (isJovian && rand() > 0.5) {
    const spotX = center + radius * 0.3;
    const spotY = center + radius * 0.1;
    const spotRx = radius * 0.25;
    const spotRy = radius * 0.18;
    const spotColor = getComplementaryHex(primaryColor);

    bands += `<ellipse cx="${spotX}" cy="${spotY}" rx="${spotRx}" ry="${spotRy}" fill="${spotColor}" opacity="0.35"/>`;
  }

  bands += '</g>';

  return bands;
}

function getComplementaryHex(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Desplazar hacia un tono diferente pero no complementario puro
  const newR = (r + 128) % 256;
  const newG = (g + 64) % 256;
  const newB = (b + 192) % 256;

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

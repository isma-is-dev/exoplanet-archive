import { PlanetType } from '@exodex/shared-types';
import { desaturateHex } from './color.algorithm';

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

export function buildRings(
  radius: number,
  center: number,
  secondaryColor: string
): string {
  const ringColor1 = desaturateHex(secondaryColor, 0.3);
  const ringColor2 = desaturateHex(secondaryColor, 0.5);

  const majorAxis1 = radius * 2.2;
  const minorAxis1 = radius * 0.35;
  const majorAxis2 = radius * 2.8;
  const minorAxis2 = radius * 0.35;

  const rotation = -15;

  // Clip path para ocultar la parte trasera de los anillos
  const clipId = `ring-clip-${Math.random().toString(36).substr(2, 9)}`;

  return `
    <defs>
      <clipPath id="${clipId}">
        <rect x="0" y="${center}" width="${center * 2}" height="${center}" />
      </clipPath>
    </defs>
    <!-- Anillos traseros -->
    <ellipse
      cx="${center}"
      cy="${center}"
      rx="${majorAxis1 / 2}"
      ry="${minorAxis1 / 2}"
      fill="none"
      stroke="${ringColor1}"
      stroke-width="${radius * 0.08}"
      opacity="0.45"
      transform="rotate(${rotation} ${center} ${center})"
    />
    <ellipse
      cx="${center}"
      cy="${center}"
      rx="${majorAxis2 / 2}"
      ry="${minorAxis2 / 2}"
      fill="none"
      stroke="${ringColor2}"
      stroke-width="${radius * 0.06}"
      opacity="0.30"
      transform="rotate(${rotation} ${center} ${center})"
    />
    <!-- Anillos delanteros (solo parte inferior, clippeada) -->
    <g clip-path="url(#${clipId})">
      <ellipse
        cx="${center}"
        cy="${center}"
        rx="${majorAxis1 / 2}"
        ry="${minorAxis1 / 2}"
        fill="none"
        stroke="${ringColor1}"
        stroke-width="${radius * 0.08}"
        opacity="0.45"
        transform="rotate(${rotation} ${center} ${center})"
      />
      <ellipse
        cx="${center}"
        cy="${center}"
        rx="${majorAxis2 / 2}"
        ry="${minorAxis2 / 2}"
        fill="none"
        stroke="${ringColor2}"
        stroke-width="${radius * 0.06}"
        opacity="0.30"
        transform="rotate(${rotation} ${center} ${center})"
      />
    </g>
  `;
}

export type RenderSize = 'micro' | 'card' | 'detail';

export function getPlanetVisualRadius(
  radiusEarth: number | null,
  size: RenderSize
): number {
  const baseRadius = { micro: 12, card: 48, detail: 128 }[size];
  if (radiusEarth === null) return baseRadius * 0.7;

  // Escala logarítmica: Tierra=1.0 → radio base. Júpiter≈11 → radio base * 1.8
  const scale = Math.min(Math.max(Math.log10(radiusEarth + 1) / Math.log10(12), 0.25), 1.8);
  return baseRadius * scale;
}

export function getViewBoxSize(size: RenderSize): number {
  return { micro: 32, card: 160, detail: 320 }[size];
}

export function getSvgSize(size: RenderSize): number {
  return { micro: 32, card: 120, detail: 320 }[size];
}

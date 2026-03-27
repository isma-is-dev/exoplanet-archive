export function buildAtmosphereGlow(
  radius: number,
  center: number,
  color: string,
  equilibriumTempK: number | null,
  insolationFlux: number | null
): string {
  // Solo mostrar atmósfera si hay datos de temperatura o flujo
  if (insolationFlux === null && equilibriumTempK === null) {
    return '';
  }

  const glowRadius = radius * 1.15;
  let glowColor = color;
  let glowOpacity = 0.12;

  // Temperatura alta: glow naranja/rojo
  if (equilibriumTempK !== null && equilibriumTempK > 700) {
    glowColor = '#FF6A28';
    glowOpacity = 0.20;
  }

  // Temperatura baja: glow azul claro
  if (equilibriumTempK !== null && equilibriumTempK < 200) {
    glowColor = '#A8D4F0';
    glowOpacity = 0.15;
  }

  const gradientId = `atm-${Math.random().toString(36).substr(2, 9)}`;

  return `
    <defs>
      <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${glowColor}" stop-opacity="0"/>
        <stop offset="70%" stop-color="${glowColor}" stop-opacity="${glowOpacity * 0.5}"/>
        <stop offset="100%" stop-color="${glowColor}" stop-opacity="${glowOpacity}"/>
      </radialGradient>
    </defs>
    <circle cx="${center}" cy="${center}" r="${glowRadius}" fill="url(#${gradientId})"/>
  `;
}

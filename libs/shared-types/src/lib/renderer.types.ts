import { PlanetType } from './exoplanet.types';

export interface PlanetRenderParams {
  // Entrada: propiedades del planeta
  radiusEarth: number | null;
  massEarth: number | null;
  equilibriumTempK: number | null;
  planetType: PlanetType;
  densityGCC: number | null;
  eccentricity: number | null;
  insolationFlux: number | null;
  discoveryYear: number | null;

  // Datos orbitales para animación
  orbitalPeriodDays: number | null;

  // Configuración del render
  size: 'card' | 'detail' | 'micro'; // micro=32px, card=120px, detail=320px
  animationsEnabled: boolean;
}

export interface PlanetRenderOutput {
  svgString: string;
  primaryColor: string; // hex para uso en UI
  secondaryColor: string;
  description: string; // descripción auto-generada del aspecto
}

export interface StarRenderParams {
  stellarTempK: number | null;
  stellarRadiusSun: number | null;
  stellarMassSun: number | null;
  numberOfStarsInSystem?: number | null;
  size: 'card' | 'detail' | 'micro';
  animationsEnabled: boolean;
}

export interface StarRenderOutput {
  svgString: string;
  primaryColor: string;
  spectralClass: string;
}

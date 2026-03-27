import { PlanetType } from './exoplanet.types';
export interface PlanetRenderParams {
    radiusEarth: number | null;
    massEarth: number | null;
    equilibriumTempK: number | null;
    planetType: PlanetType;
    densityGCC: number | null;
    eccentricity: number | null;
    insolationFlux: number | null;
    discoveryYear: number | null;
    size: 'card' | 'detail' | 'micro';
    animationsEnabled: boolean;
}
export interface PlanetRenderOutput {
    svgString: string;
    primaryColor: string;
    secondaryColor: string;
    description: string;
}

import { PlanetType } from '@exodex/shared-types';
export declare function seededRandom(seed: string): () => number;
export declare function buildSurfaceDetails(planetType: PlanetType, radius: number, center: number, primaryColor: string, secondaryColor: string, equilibriumTempK: number | null, planetName: string): string;

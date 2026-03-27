import { PlanetType } from '@exodex/shared-types';
export declare function shouldShowRings(planetType: PlanetType, radiusEarth: number | null): boolean;
export declare function buildRings(radius: number, center: number, secondaryColor: string): string;

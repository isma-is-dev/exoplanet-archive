import { PlanetType } from '@exodex/shared-types';
export interface PlanetColors {
    primary: string;
    secondary: string;
}
export declare function getPlanetColors(planetType: PlanetType, equilibriumTempK: number | null): PlanetColors;
export declare function lightenHex(hex: string, factor: number): string;
export declare function darkenHex(hex: string, factor: number): string;
export declare function desaturateHex(hex: string, factor: number): string;
export declare function getComplementaryColor(hex: string): string;

import { PlanetRenderOutput, PlanetRenderParams } from '@exodex/shared-types';
export declare function renderPlanet(params: PlanetRenderParams, planetName?: string): PlanetRenderOutput;
export { getPlanetColors, lightenHex, darkenHex } from './algorithms/color.algorithm';
export { getPlanetVisualRadius, getViewBoxSize } from './algorithms/size.algorithm';
export type { RenderSize } from './algorithms/size.algorithm';

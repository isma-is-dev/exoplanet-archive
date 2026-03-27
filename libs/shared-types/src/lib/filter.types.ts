import { DiscoveryMethod, HabitabilityClass, PlanetType } from './exoplanet.types';

export interface ExoplanetFilters {
  planetTypes: PlanetType[];
  discoveryMethods: DiscoveryMethod[];
  habitabilityClasses: HabitabilityClass[];
  discoveryYearRange: [number, number] | null;
  radiusEarthRange: [number, number] | null;
  massEarthRange: [number, number] | null;
  equilibriumTempKRange: [number, number] | null;
  searchQuery: string;
}

export type SortField =
  | 'index'
  | 'name'
  | 'discoveryYear'
  | 'radiusEarth'
  | 'massEarth'
  | 'equilibriumTempK'
  | 'habitabilityScore'
  | 'orbitalPeriodDays'
  | 'distanceParsec';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

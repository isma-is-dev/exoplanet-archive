import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Exoplanet, ExoplanetFilters, SortState, PlanetType, DiscoveryMethod, HabitabilityClass } from '@exodex/shared-types';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Helper para crear objetos Exoplanet completos
function createMockPlanet(partial: Partial<Exoplanet>): Exoplanet {
  return {
    // Campos requeridos con valores por defecto
    id: partial.id || '',
    name: partial.name || '',
    index: partial.index || 0,
    hostStar: partial.hostStar || '',
    letter: partial.letter || 'b',
    planetType: partial.planetType || 'unknown',
    habitabilityClass: partial.habitabilityClass || 'unknown',
    discoveryMethod: partial.discoveryMethod || 'Other',
    discoveryYear: partial.discoveryYear ?? null,
    discoveryFacility: partial.discoveryFacility ?? null,
    telescope: partial.telescope ?? null,
    orbitalPeriodDays: partial.orbitalPeriodDays ?? null,
    semiMajorAxisAU: partial.semiMajorAxisAU ?? null,
    eccentricity: partial.eccentricity ?? null,
    inclinationDeg: partial.inclinationDeg ?? null,
    radiusEarth: partial.radiusEarth ?? null,
    radiusJupiter: partial.radiusJupiter ?? null,
    massEarth: partial.massEarth ?? null,
    massJupiter: partial.massJupiter ?? null,
    densityGCC: partial.densityGCC ?? null,
    gravityMS2: partial.gravityMS2 ?? null,
    equilibriumTempK: partial.equilibriumTempK ?? null,
    insolationFlux: partial.insolationFlux ?? null,
    stellarTempK: partial.stellarTempK ?? null,
    stellarRadiusSun: partial.stellarRadiusSun ?? null,
    stellarMassSun: partial.stellarMassSun ?? null,
    stellarMetallicity: partial.stellarMetallicity ?? null,
    stellarAge: partial.stellarAge ?? null,
    rightAscension: partial.rightAscension ?? null,
    declination: partial.declination ?? null,
    distanceParsec: partial.distanceParsec ?? null,
    habitabilityScore: partial.habitabilityScore ?? 0,
    referenceUrl: partial.referenceUrl ?? null,
    hasAtmosphereData: partial.hasAtmosphereData ?? false,
    numberOfStarsInSystem: partial.numberOfStarsInSystem ?? 1,
    numberOfKnownPlanetsInSystem: partial.numberOfKnownPlanetsInSystem ?? null,
  };
}

// Datos base de exoplanetas (usando tipo que permite strings literales)
const MOCK_PLANETS_BASE: Array<Partial<Exoplanet> & { habitabilityClass: string; planetType: string; discoveryMethod: string }> = [
  {
    id: 'kepler-186f',
    name: 'Kepler-186 f',
    index: 1,
    hostStar: 'Kepler-186',
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2014,
    discoveryMethod: 'Transit',
    discoveryFacility: 'Kepler',
    telescope: 'Kepler Space Telescope',
    orbitalPeriodDays: 129.9,
    semiMajorAxisAU: 0.4,
    eccentricity: null,
    inclinationDeg: null,
    radiusEarth: 1.17,
    massEarth: 1.71,
    densityGCC: 6.0,
    gravityMS2: null,
    equilibriumTempK: 188,
    stellarTempK: 3788,
    stellarRadiusSun: 0.47,
    stellarMassSun: 0.54,
    stellarMetallicity: null,
    stellarAge: 4,
  },
  {
    id: 'proxima-centauri-b',
    name: 'Proxima Centauri b',
    index: 2,
    hostStar: 'Proxima Centauri',
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2016,
    discoveryMethod: 'Radial Velocity',
    discoveryFacility: 'ESO',
    telescope: 'HARPS',
    orbitalPeriodDays: 11.19,
    semiMajorAxisAU: 0.05,
    eccentricity: 0.1,
    inclinationDeg: null,
    radiusEarth: 1.07,
    massEarth: 1.17,
    densityGCC: 5.5,
    gravityMS2: 10.2,
    equilibriumTempK: 234,
    stellarTempK: 3050,
    stellarRadiusSun: 0.14,
    stellarMassSun: 0.12,
    stellarMetallicity: 0.21,
    stellarAge: 4.85,
    numberOfStarsInSystem: 3,
  },
  {
    id: 'trappist-1e',
    name: 'TRAPPIST-1 e',
    index: 3,
    hostStar: 'TRAPPIST-1',
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2017,
    discoveryMethod: 'Transit',
    discoveryFacility: 'Spitzer Space Telescope',
    telescope: 'Spitzer',
    orbitalPeriodDays: 6.1,
    semiMajorAxisAU: 0.029,
    eccentricity: 0.005,
    inclinationDeg: 89.7,
    radiusEarth: 0.92,
    massEarth: 0.69,
    densityGCC: 5.2,
    gravityMS2: 8.1,
    equilibriumTempK: 251,
    stellarTempK: 2566,
    stellarRadiusSun: 0.12,
    stellarMassSun: 0.09,
    stellarMetallicity: 0.04,
    stellarAge: 7.6,
  },
  {
    id: 'trappist-1b',
    name: 'TRAPPIST-1 b',
    index: 21,
    hostStar: 'TRAPPIST-1',
    letter: 'b',
    planetType: 'rocky-terrestrial',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 2016,
    discoveryMethod: 'Transit',
    discoveryFacility: 'TRAPPIST',
    telescope: 'Spitzer',
    orbitalPeriodDays: 1.51,
    semiMajorAxisAU: 0.011,
    eccentricity: 0.006,
    inclinationDeg: 89.6,
    radiusEarth: 1.12,
    massEarth: 1.02,
    densityGCC: 5.8,
    gravityMS2: 8.0,
    equilibriumTempK: 400,
    stellarTempK: 2566,
    stellarRadiusSun: 0.12,
    stellarMassSun: 0.09,
    stellarMetallicity: 0.04,
    stellarAge: 7.6,
  },
  {
    id: 'trappist-1d',
    name: 'TRAPPIST-1 d',
    index: 22,
    hostStar: 'TRAPPIST-1',
    letter: 'd',
    planetType: 'rocky-terrestrial',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2017,
    discoveryMethod: 'Transit',
    discoveryFacility: 'Spitzer Space Telescope',
    telescope: 'Spitzer',
    orbitalPeriodDays: 4.05,
    semiMajorAxisAU: 0.022,
    eccentricity: 0.004,
    inclinationDeg: 89.8,
    radiusEarth: 0.77,
    massEarth: 0.39,
    densityGCC: 4.6,
    gravityMS2: 6.5,
    equilibriumTempK: 288,
    stellarTempK: 2566,
    stellarRadiusSun: 0.12,
    stellarMassSun: 0.09,
    stellarMetallicity: 0.04,
    stellarAge: 7.6,
  },
  {
    id: 'trappist-1f',
    name: 'TRAPPIST-1 f',
    index: 23,
    hostStar: 'TRAPPIST-1',
    letter: 'f',
    planetType: 'rocky-terrestrial',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2017,
    discoveryMethod: 'Transit',
    discoveryFacility: 'Spitzer Space Telescope',
    telescope: 'Spitzer',
    orbitalPeriodDays: 9.21,
    semiMajorAxisAU: 0.038,
    eccentricity: 0.01,
    inclinationDeg: 89.7,
    radiusEarth: 1.05,
    massEarth: 0.93,
    densityGCC: 5.0,
    gravityMS2: 8.3,
    equilibriumTempK: 219,
    stellarTempK: 2566,
    stellarRadiusSun: 0.12,
    stellarMassSun: 0.09,
    stellarMetallicity: 0.04,
    stellarAge: 7.6,
  },
  {
    id: 'hd-209458-b',
    name: 'HD 209458 b',
    index: 4,
    hostStar: 'HD 209458',
    planetType: 'hot-jupiter',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 1999,
    discoveryMethod: 'Transit',
    discoveryFacility: 'Haute-Provence',
    telescope: 'Hubble Space Telescope',
    orbitalPeriodDays: 3.52,
    semiMajorAxisAU: 0.05,
    eccentricity: 0.01,
    inclinationDeg: 86.7,
    radiusEarth: 14.3,
    massEarth: 206.0,
    densityGCC: 0.4,
    gravityMS2: 9.7,
    equilibriumTempK: 1300,
    stellarTempK: 6091,
    stellarRadiusSun: 1.2,
    stellarMassSun: 1.15,
    stellarMetallicity: 0.02,
    stellarAge: 4,
  },
  {
    id: 'kepler-22b',
    name: 'Kepler-22 b',
    index: 5,
    hostStar: 'Kepler-22',
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2011,
    discoveryMethod: 'Transit',
    discoveryFacility: 'Kepler',
    telescope: 'Kepler Space Telescope',
    orbitalPeriodDays: 289.9,
    semiMajorAxisAU: 0.85,
    eccentricity: null,
    inclinationDeg: 89.7,
    radiusEarth: 2.4,
    massEarth: null,
    densityGCC: null,
    gravityMS2: null,
    equilibriumTempK: 279,
    stellarTempK: 5518,
    stellarRadiusSun: 0.98,
    stellarMassSun: 1.0,
    stellarMetallicity: -0.29,
    stellarAge: null,
  },
  {
    id: 'gj-1214-b',
    name: 'GJ 1214 b',
    index: 6,
    hostStar: 'GJ 1214',
    planetType: 'mini-neptune',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 2009,
    discoveryMethod: 'Transit',
    discoveryFacility: 'MEarth',
    telescope: 'MEarth Array',
    orbitalPeriodDays: 1.58,
    semiMajorAxisAU: 0.01,
    eccentricity: null,
    inclinationDeg: 88.6,
    radiusEarth: 2.74,
    massEarth: 6.55,
    densityGCC: 1.87,
    gravityMS2: 8.7,
    equilibriumTempK: 580,
    stellarTempK: 3250,
    stellarRadiusSun: 0.21,
    stellarMassSun: 0.18,
    stellarMetallicity: null,
    stellarAge: 6,
  },
  {
    id: 'k2-18b',
    name: 'K2-18 b',
    index: 7,
    hostStar: 'K2-18',
    planetType: 'mini-neptune',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2015,
    discoveryMethod: 'Transit',
    discoveryFacility: 'K2',
    telescope: 'Kepler Space Telescope',
    orbitalPeriodDays: 33.0,
    semiMajorAxisAU: 0.14,
    eccentricity: 0.2,
    inclinationDeg: null,
    radiusEarth: 2.71,
    massEarth: 8.63,
    densityGCC: 2.3,
    gravityMS2: 11.7,
    equilibriumTempK: 272,
    stellarTempK: 3457,
    stellarRadiusSun: 0.45,
    stellarMassSun: 0.36,
    stellarMetallicity: 0.1,
    stellarAge: 2.4,
  },
  {
    id: 'wasp-12b',
    name: 'WASP-12 b',
    index: 8,
    hostStar: 'WASP-12',
    planetType: 'hot-jupiter',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 2008,
    discoveryMethod: 'Transit',
    discoveryFacility: 'WASP',
    telescope: 'SuperWASP',
    orbitalPeriodDays: 1.09,
    semiMajorAxisAU: 0.02,
    eccentricity: 0.05,
    inclinationDeg: 83.4,
    radiusEarth: 19.5,
    massEarth: 415.0,
    densityGCC: 0.31,
    gravityMS2: 10.8,
    equilibriumTempK: 2516,
    stellarTempK: 6360,
    stellarRadiusSun: 1.7,
    stellarMassSun: 1.4,
    stellarMetallicity: 0.3,
    stellarAge: 2,
  },
  {
    id: '55-cancri-e',
    name: '55 Cancri e',
    index: 9,
    hostStar: '55 Cancri',
    planetType: 'super-earth',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 2004,
    discoveryMethod: 'Radial Velocity',
    discoveryFacility: 'McDonald Observatory',
    telescope: 'HIRES',
    orbitalPeriodDays: 0.74,
    semiMajorAxisAU: 0.02,
    eccentricity: 0.05,
    inclinationDeg: null,
    radiusEarth: 1.88,
    massEarth: 7.81,
    densityGCC: 6.7,
    gravityMS2: 22.0,
    equilibriumTempK: 1942,
    stellarTempK: 5196,
    stellarRadiusSun: 0.95,
    stellarMassSun: 0.91,
    stellarMetallicity: 0.35,
    stellarAge: 10.2,
  },
  {
    id: 'gliese-581g',
    name: 'Gliese 581 g',
    index: 10,
    hostStar: 'Gliese 581',
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2010,
    discoveryMethod: 'Radial Velocity',
    discoveryFacility: 'Keck Observatory',
    telescope: 'HIRES',
    orbitalPeriodDays: 32.0,
    semiMajorAxisAU: 0.13,
    eccentricity: 0,
    inclinationDeg: null,
    radiusEarth: 1.4,
    massEarth: 2.3,
    densityGCC: 5.2,
    gravityMS2: 11.8,
    equilibriumTempK: 283,
    stellarTempK: 3480,
    stellarRadiusSun: 0.3,
    stellarMassSun: 0.31,
    stellarMetallicity: -0.33,
    stellarAge: 7,
  },
  {
    id: 'kepler-452b',
    name: 'Kepler-452 b',
    index: 11,
    hostStar: 'Kepler-452',
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2015,
    discoveryMethod: 'Transit',
    discoveryFacility: 'Kepler',
    telescope: 'Kepler Space Telescope',
    orbitalPeriodDays: 384.8,
    semiMajorAxisAU: 1.05,
    eccentricity: null,
    inclinationDeg: 89.8,
    radiusEarth: 1.63,
    massEarth: 5.0,
    densityGCC: 6.5,
    gravityMS2: 18.8,
    equilibriumTempK: 265,
    stellarTempK: 5757,
    stellarRadiusSun: 1.11,
    stellarMassSun: 1.04,
    stellarMetallicity: 0.21,
    stellarAge: 6,
  },
  {
    id: 'toi-700d',
    name: 'TOI-700 d',
    index: 12,
    hostStar: 'TOI-700',
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2020,
    discoveryMethod: 'Transit',
    discoveryFacility: 'TESS',
    telescope: 'TESS Satellite',
    orbitalPeriodDays: 37.4,
    semiMajorAxisAU: 0.16,
    eccentricity: null,
    inclinationDeg: null,
    radiusEarth: 1.07,
    massEarth: 1.72,
    densityGCC: 7.4,
    gravityMS2: 15.0,
    equilibriumTempK: 268,
    stellarTempK: 3480,
    stellarRadiusSun: 0.42,
    stellarMassSun: 0.41,
    stellarMetallicity: -0.1,
    stellarAge: 1.5,
  },
  {
    id: 'hd-189733b',
    name: 'HD 189733 b',
    index: 13,
    hostStar: 'HD 189733',
    planetType: 'hot-jupiter',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 2005,
    discoveryMethod: 'Transit',
    discoveryFacility: 'Haute-Provence',
    telescope: 'HAT-9',
    orbitalPeriodDays: 2.22,
    semiMajorAxisAU: 0.03,
    eccentricity: 0,
    inclinationDeg: 85.7,
    radiusEarth: 13.7,
    massEarth: 111.0,
    densityGCC: 0.95,
    gravityMS2: 5.7,
    equilibriumTempK: 1200,
    stellarTempK: 4980,
    stellarRadiusSun: 0.8,
    stellarMassSun: 0.82,
    stellarMetallicity: -0.03,
    stellarAge: null,
  },
  {
    id: 'jupiter-analog',
    name: 'Jupiter Analog',
    index: 14,
    hostStar: 'Sun-like Star',
    planetType: 'cold-giant',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 2023,
    discoveryMethod: 'Direct Imaging',
    discoveryFacility: 'Gemini Observatory',
    telescope: 'Gemini Planet Imager',
    orbitalPeriodDays: 4332,
    semiMajorAxisAU: 5.2,
    eccentricity: 0.05,
    inclinationDeg: null,
    radiusEarth: 11.2,
    massEarth: 317.8,
    densityGCC: 1.33,
    gravityMS2: 24.8,
    equilibriumTempK: 120,
    stellarTempK: 5778,
    stellarRadiusSun: 1.0,
    stellarMassSun: 1.0,
    stellarMetallicity: 0.0,
    stellarAge: 4.6,
  },
  {
    id: 'ltt-9779b',
    name: 'LTT 9779 b',
    index: 15,
    hostStar: 'LTT 9779',
    planetType: 'super-earth',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 2020,
    discoveryMethod: 'Transit',
    discoveryFacility: 'TESS',
    telescope: 'TESS Satellite',
    orbitalPeriodDays: 0.79,
    semiMajorAxisAU: 0.02,
    eccentricity: null,
    inclinationDeg: null,
    radiusEarth: 4.72,
    massEarth: 29.3,
    densityGCC: 1.59,
    gravityMS2: 13.1,
    equilibriumTempK: 2000,
    stellarTempK: 5473,
    stellarRadiusSun: 0.95,
    stellarMassSun: 0.93,
    stellarMetallicity: 0.0,
    stellarAge: null,
  },
  {
    id: 'tau-ceti-e',
    name: 'Tau Ceti e',
    index: 16,
    hostStar: 'Tau Ceti',
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2017,
    discoveryMethod: 'Radial Velocity',
    discoveryFacility: 'ESO',
    telescope: 'HARPS',
    orbitalPeriodDays: 162.9,
    semiMajorAxisAU: 0.54,
    eccentricity: 0.18,
    inclinationDeg: null,
    radiusEarth: 1.9,
    massEarth: 4.3,
    densityGCC: 3.5,
    gravityMS2: 11.9,
    equilibriumTempK: 315,
    stellarTempK: 5344,
    stellarRadiusSun: 0.79,
    stellarMassSun: 0.78,
    stellarMetallicity: -0.55,
    stellarAge: 5.8,
  },
  {
    id: 'luyten-b',
    name: 'Luyten b',
    index: 17,
    hostStar: "Luyten's Star",
    planetType: 'super-earth',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2017,
    discoveryMethod: 'Radial Velocity',
    discoveryFacility: 'MEarth',
    telescope: 'MEarth Array',
    orbitalPeriodDays: 18.65,
    semiMajorAxisAU: 0.09,
    eccentricity: 0.1,
    inclinationDeg: null,
    radiusEarth: 1.35,
    massEarth: 2.89,
    densityGCC: 6.3,
    gravityMS2: 15.8,
    equilibriumTempK: 259,
    stellarTempK: 3150,
    stellarRadiusSun: 0.3,
    stellarMassSun: 0.26,
    stellarMetallicity: null,
    stellarAge: 8,
  },
  {
    id: 'corot-7b',
    name: 'CoRoT-7 b',
    index: 18,
    hostStar: 'CoRoT-7',
    planetType: 'super-earth',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 2009,
    discoveryMethod: 'Transit',
    discoveryFacility: 'CoRoT',
    telescope: 'CoRoT Satellite',
    orbitalPeriodDays: 0.85,
    semiMajorAxisAU: 0.02,
    eccentricity: null,
    inclinationDeg: null,
    radiusEarth: 1.58,
    massEarth: 5.74,
    densityGCC: 8.0,
    gravityMS2: 23.0,
    equilibriumTempK: 1756,
    stellarTempK: 5275,
    stellarRadiusSun: 0.87,
    stellarMassSun: 0.91,
    stellarMetallicity: 0.12,
    stellarAge: 1.5,
  },
  {
    id: 'lhs-1140b',
    name: 'LHS 1140 b',
    index: 19,
    hostStar: 'LHS 1140',
    planetType: 'rocky-terrestrial',
    habitabilityClass: 'potentially-habitable',
    discoveryYear: 2017,
    discoveryMethod: 'Transit',
    discoveryFacility: 'MEarth',
    telescope: 'MEarth Array',
    orbitalPeriodDays: 24.74,
    semiMajorAxisAU: 0.09,
    eccentricity: 0.06,
    inclinationDeg: null,
    radiusEarth: 1.43,
    massEarth: 6.65,
    densityGCC: 7.5,
    gravityMS2: 32.5,
    equilibriumTempK: 230,
    stellarTempK: 3215,
    stellarRadiusSun: 0.19,
    stellarMassSun: 0.18,
    stellarMetallicity: -0.24,
    stellarAge: 5,
  },
  {
    id: 'pegasi-51b',
    name: '51 Pegasi b',
    index: 20,
    hostStar: '51 Pegasi',
    planetType: 'hot-jupiter',
    habitabilityClass: 'uninhabitable',
    discoveryYear: 1995,
    discoveryMethod: 'Radial Velocity',
    discoveryFacility: 'Haute-Provence',
    telescope: 'ELODIE',
    orbitalPeriodDays: 4.23,
    semiMajorAxisAU: 0.05,
    eccentricity: 0.01,
    inclinationDeg: null,
    radiusEarth: 14.3,
    massEarth: 150.0,
    densityGCC: 0.4,
    gravityMS2: 7.3,
    equilibriumTempK: 1284,
    stellarTempK: 5793,
    stellarRadiusSun: 1.2,
    stellarMassSun: 1.03,
    stellarMetallicity: 0.2,
    stellarAge: 6.5,
  },
];

// Convertir datos base a objetos Exoplanet completos
const MOCK_EXOPLANETS: Exoplanet[] = MOCK_PLANETS_BASE.map(createMockPlanet);

@Injectable({
  providedIn: 'root',
})
export class ExoplanetMockService {
  private mockData = MOCK_EXOPLANETS;

  getExoplanets$(
    filters: ExoplanetFilters,
    sort: SortState,
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<Exoplanet>> {
    let filtered = this.filterPlanets(this.mockData, filters);
    filtered = this.sortPlanets(filtered, sort);

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Exoplanet> = {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };

    // Simular delay de red
    return of(response).pipe(delay(300));
  }

  getStats$(): Observable<{
    totalCount: number;
    typeDistribution: Record<string, number>;
    methodDistribution: Record<string, number>;
    yearRange: [number, number];
    radiusRange: [number, number];
  }> {
    const typeDistribution: Record<string, number> = {};
    const methodDistribution: Record<string, number> = {};
    const years: number[] = [];
    const radii: number[] = [];

    for (const planet of this.mockData) {
      // Tipo
      typeDistribution[planet.planetType] = (typeDistribution[planet.planetType] || 0) + 1;
      // Método
      methodDistribution[planet.discoveryMethod] = (methodDistribution[planet.discoveryMethod] || 0) + 1;
      // Año
      if (planet.discoveryYear) years.push(planet.discoveryYear);
      // Radio
      if (planet.radiusEarth) radii.push(planet.radiusEarth);
    }

    const stats = {
      totalCount: this.mockData.length,
      typeDistribution,
      methodDistribution,
      yearRange: [Math.min(...years), Math.max(...years)] as [number, number],
      radiusRange: [Math.min(...radii), Math.max(...radii)] as [number, number],
    };

    return of(stats).pipe(delay(200));
  }

  getById$(id: string): Observable<Exoplanet | null> {
    const planet = this.mockData.find((p) => p.id === id) || null;
    return of(planet).pipe(delay(200));
  }

  getSystemPlanets$(hostStar: string): Observable<Exoplanet[]> {
    const planets = this.mockData.filter((p) => p.hostStar === hostStar);
    return of(planets).pipe(delay(200));
  }

  private filterPlanets(planets: Exoplanet[], filters: ExoplanetFilters): Exoplanet[] {
    return planets.filter((planet) => {
      // Filtro por búsqueda
      if (filters.searchQuery?.trim()) {
        const search = filters.searchQuery.toLowerCase();
        const nameMatch = planet.name.toLowerCase().includes(search);
        const hostMatch = planet.hostStar.toLowerCase().includes(search);
        if (!nameMatch && !hostMatch) return false;
      }

      // Filtro por tipo
      if (filters.planetTypes?.length && !filters.planetTypes.includes(planet.planetType)) {
        return false;
      }

      // Filtro por habitabilidad
      if (filters.habitabilityClasses?.length && !filters.habitabilityClasses.includes(planet.habitabilityClass)) {
        return false;
      }

      // Filtro por método de descubrimiento
      if (filters.discoveryMethods?.length && !filters.discoveryMethods.includes(planet.discoveryMethod)) {
        return false;
      }

      // Filtro por año
      if (filters.discoveryYearRange) {
        const year = planet.discoveryYear ?? 0;
        if (year < filters.discoveryYearRange[0] || year > filters.discoveryYearRange[1]) {
          return false;
        }
      }

      // Filtro por radio
      if (filters.radiusEarthRange) {
        const radius = planet.radiusEarth ?? 0;
        if (radius < filters.radiusEarthRange[0] || radius > filters.radiusEarthRange[1]) {
          return false;
        }
      }

      // Filtro por masa
      if (filters.massEarthRange) {
        const mass = planet.massEarth ?? 0;
        if (mass < filters.massEarthRange[0] || mass > filters.massEarthRange[1]) {
          return false;
        }
      }

      // Filtro por temperatura
      if (filters.equilibriumTempKRange) {
        const temp = planet.equilibriumTempK ?? 0;
        if (temp < filters.equilibriumTempKRange[0] || temp > filters.equilibriumTempKRange[1]) {
          return false;
        }
      }

      return true;
    });
  }

  private sortPlanets(planets: Exoplanet[], sort: SortState): Exoplanet[] {
    const sorted = [...planets];
    const multiplier = sort.direction === 'desc' ? -1 : 1;

    return sorted.sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      switch (sort.field) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'discoveryYear':
          valueA = a.discoveryYear || 0;
          valueB = b.discoveryYear || 0;
          break;
        case 'radiusEarth':
          valueA = a.radiusEarth || 0;
          valueB = b.radiusEarth || 0;
          break;
        case 'equilibriumTempK':
          valueA = a.equilibriumTempK || 0;
          valueB = b.equilibriumTempK || 0;
          break;
        case 'distanceParsec':
          valueA = a.semiMajorAxisAU || 0;
          valueB = b.semiMajorAxisAU || 0;
          break;
        default:
          valueA = a.index;
          valueB = b.index;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB) * multiplier;
      }

      return (Number(valueA) - Number(valueB)) * multiplier;
    });
  }
}

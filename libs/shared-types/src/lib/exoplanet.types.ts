export interface Exoplanet {
  // Identificación
  id: string; // pl_name normalizado como slug
  index: number; // orden cronológico (calculado por backend)
  name: string; // pl_name
  hostStar: string; // hostname
  letter: string; // pl_letter (b, c, d…)

  // Orbitales
  orbitalPeriodDays: number | null; // pl_orbper
  semiMajorAxisAU: number | null; // pl_orbsmax
  eccentricity: number | null; // pl_orbeccen
  inclinationDeg: number | null; // pl_orbincl

  // Físicas del planeta
  radiusEarth: number | null; // pl_rade
  radiusJupiter: number | null; // pl_radj
  massEarth: number | null; // pl_bmasse
  massJupiter: number | null; // pl_bmassj
  densityGCC: number | null; // pl_dens
  gravityMS2: number | null; // pl_g (surface gravity)
  equilibriumTempK: number | null; // pl_eqt
  insolationFlux: number | null; // pl_insol

  // Clasificación
  planetType: PlanetType; // derivado en backend
  discoveryMethod: DiscoveryMethod; // discoverymethod
  discoveryYear: number | null; // disc_year
  discoveryFacility: string | null; // disc_facility
  telescope: string | null; // disc_telescope

  // Estrella huésped
  stellarTempK: number | null; // st_teff
  stellarRadiusSun: number | null; // st_rad
  stellarMassSun: number | null; // st_mass
  stellarMetallicity: number | null; // st_met
  stellarAge: number | null; // st_age

  // Posición
  rightAscension: number | null; // ra
  declination: number | null; // dec
  distanceParsec: number | null; // sy_dist

  // Habitabilidad (calculado en backend)
  habitabilityScore: number; // 0-100, ver sección algoritmo
  habitabilityClass: HabitabilityClass;

  // Metadatos
  referenceUrl: string | null; // pl_refname
  hasAtmosphereData: boolean;
  numberOfStarsInSystem: number | null; // sy_snum
  numberOfKnownPlanetsInSystem: number | null; // sy_pnum
}

export type PlanetType =
  | 'rocky-terrestrial'
  | 'super-earth'
  | 'mini-neptune'
  | 'neptunian'
  | 'jovian'
  | 'hot-jupiter'
  | 'cold-giant'
  | 'unknown';

export type DiscoveryMethod =
  | 'Transit'
  | 'Radial Velocity'
  | 'Direct Imaging'
  | 'Microlensing'
  | 'Astrometry'
  | 'Transit Timing Variations'
  | 'Other';

export type HabitabilityClass =
  | 'potentially-habitable'
  | 'marginal'
  | 'uninhabitable'
  | 'unknown';

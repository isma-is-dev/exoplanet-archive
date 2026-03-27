import {
  DiscoveryMethod,
  Exoplanet,
  HabitabilityClass,
  PlanetType,
} from '@exodex/shared-types';

export interface NasaExoplanetRaw {
  pl_name: string;
  hostname: string;
  pl_letter: string;
  pl_orbper: number | null;
  pl_orbsmax: number | null;
  pl_orbeccen: number | null;
  pl_orbincl: number | null;
  pl_rade: number | null;
  pl_radj: number | null;
  pl_bmasse: number | null;
  pl_bmassj: number | null;
  pl_dens: number | null;
  pl_g: number | null;
  pl_eqt: number | null;
  pl_insol: number | null;
  discoverymethod: string;
  disc_year: number | null;
  disc_facility: string | null;
  disc_telescope: string | null;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  st_met: number | null;
  st_age: number | null;
  ra: number | null;
  dec: number | null;
  sy_dist: number | null;
  sy_pnum: number | null;
  pl_refname: string | null;
}

function mapDiscoveryMethod(method: string): DiscoveryMethod {
  const mapping: Record<string, DiscoveryMethod> = {
    Transit: 'Transit',
    'Radial Velocity': 'Radial Velocity',
    'Direct Imaging': 'Direct Imaging',
    Microlensing: 'Microlensing',
    Astrometry: 'Astrometry',
    'Transit Timing Variations': 'Transit Timing Variations',
  };
  return mapping[method] || 'Other';
}

function classifyPlanetType(
  radiusEarth: number | null,
  massEarth: number | null,
  equilibriumTempK: number | null,
  orbitalPeriodDays: number | null
): PlanetType {
  if (radiusEarth === null && massEarth === null) return 'unknown';

  const r = radiusEarth ?? (massEarth ? Math.pow(massEarth, 0.55) : null);
  if (r === null) return 'unknown';

  if (r < 1.2) return 'rocky-terrestrial';
  if (r < 1.75) return 'super-earth';
  if (r < 3.5) return 'mini-neptune';
  if (r < 6.0) return 'neptunian';

  // Gigantes: diferenciar hot-jupiter de cold-giant
  if (r >= 6.0) {
    if (orbitalPeriodDays !== null && orbitalPeriodDays < 10) return 'hot-jupiter';
    return equilibriumTempK !== null && equilibriumTempK > 1000 ? 'hot-jupiter' : 'jovian';
  }

  return 'unknown';
}

function calculateHabitabilityScore(
  planet: Partial<Exoplanet>
): number {
  let score = 0;
  let factors = 0;

  // Factor 1: Temperatura de equilibrio (peso: 40%)
  if (planet.equilibriumTempK !== null && planet.equilibriumTempK !== undefined) {
    const tempOptimal = 255;
    const tempMin = 180, tempMax = 340;
    if (planet.equilibriumTempK >= tempMin && planet.equilibriumTempK <= tempMax) {
      const deviation = Math.abs(planet.equilibriumTempK - tempOptimal) / (tempMax - tempMin);
      score += (1 - deviation) * 40;
    }
    factors += 40;
  }

  // Factor 2: Radio del planeta (peso: 25%)
  if (planet.radiusEarth !== null && planet.radiusEarth !== undefined) {
    if (planet.radiusEarth >= 0.5 && planet.radiusEarth <= 2.0) {
      const deviation = Math.abs(planet.radiusEarth - 1.0) / 1.5;
      score += (1 - deviation) * 25;
    }
    factors += 25;
  }

  // Factor 3: Masa del planeta (peso: 20%)
  if (planet.massEarth !== null && planet.massEarth !== undefined) {
    if (planet.massEarth >= 0.1 && planet.massEarth <= 5.0) {
      const deviation = Math.abs(planet.massEarth - 1.0) / 4.0;
      score += (1 - deviation) * 20;
    }
    factors += 20;
  }

  // Factor 4: Flujo de insolación (peso: 15%)
  if (planet.insolationFlux !== null && planet.insolationFlux !== undefined) {
    if (planet.insolationFlux >= 0.25 && planet.insolationFlux <= 1.8) {
      const deviation = Math.abs(planet.insolationFlux - 1.0) / 1.55;
      score += (1 - deviation) * 15;
    }
    factors += 15;
  }

  if (factors === 0) return 0;
  return Math.round((score / factors) * 100);
}

function classifyHabitability(
  score: number,
  type: PlanetType
): HabitabilityClass {
  if (type === 'hot-jupiter' || type === 'jovian' || type === 'cold-giant') return 'uninhabitable';
  if (score === 0) return 'unknown';
  if (score >= 60) return 'potentially-habitable';
  if (score >= 30) return 'marginal';
  return 'uninhabitable';
}

function normalizeId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function transformNasaData(raw: NasaExoplanetRaw, index: number): Exoplanet {
  const planetType = classifyPlanetType(
    raw.pl_rade,
    raw.pl_bmasse,
    raw.pl_eqt,
    raw.pl_orbper
  );

  const basePlanet: Partial<Exoplanet> = {
    radiusEarth: raw.pl_rade,
    massEarth: raw.pl_bmasse,
    equilibriumTempK: raw.pl_eqt,
    insolationFlux: raw.pl_insol,
  };

  const habitabilityScore = calculateHabitabilityScore(basePlanet);
  const habitabilityClass = classifyHabitability(habitabilityScore, planetType);

  return {
    id: normalizeId(raw.pl_name),
    index,
    name: raw.pl_name,
    hostStar: raw.hostname,
    letter: raw.pl_letter,
    orbitalPeriodDays: raw.pl_orbper,
    semiMajorAxisAU: raw.pl_orbsmax,
    eccentricity: raw.pl_orbeccen,
    inclinationDeg: raw.pl_orbincl,
    radiusEarth: raw.pl_rade,
    radiusJupiter: raw.pl_radj,
    massEarth: raw.pl_bmasse,
    massJupiter: raw.pl_bmassj,
    densityGCC: raw.pl_dens,
    gravityMS2: raw.pl_g,
    equilibriumTempK: raw.pl_eqt,
    insolationFlux: raw.pl_insol,
    planetType,
    discoveryMethod: mapDiscoveryMethod(raw.discoverymethod),
    discoveryYear: raw.disc_year,
    discoveryFacility: raw.disc_facility,
    telescope: raw.disc_telescope,
    stellarTempK: raw.st_teff,
    stellarRadiusSun: raw.st_rad,
    stellarMassSun: raw.st_mass,
    stellarMetallicity: raw.st_met,
    stellarAge: raw.st_age,
    rightAscension: raw.ra,
    declination: raw.dec,
    distanceParsec: raw.sy_dist,
    habitabilityScore,
    habitabilityClass,
    referenceUrl: raw.pl_refname,
    hasAtmosphereData: false, // No hay datos de atmósfera en TAP actualmente
    numberOfKnownPlanetsInSystem: raw.sy_pnum,
  };
}

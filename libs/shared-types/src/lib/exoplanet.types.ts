export interface Exoplanet {
  // Identificación
  id: string; // pl_name normalizado como slug
  index: number; // orden cronológico (calculado por backend)
  name: string; // pl_name
  hostStar: string; // hostname
  letter: string; // pl_letter (b, c, d…)

  // Orbitales
  orbitalPeriodDays: number | null; // pl_orbper
  orbitalPeriodErr1: number | null; // pl_orbper_err1 (+incertidumbre)
  orbitalPeriodErr2: number | null; // pl_orbper_err2 (-incertidumbre)
  semiMajorAxisAU: number | null; // pl_orbsmax
  eccentricity: number | null; // pl_orbeccen
  inclinationDeg: number | null; // pl_orbincl (no siempre disponible en CSV)

  // Físicas del planeta
  radiusEarth: number | null; // pl_rade
  radiusEarthErr1: number | null; // pl_rade_err1 (+incertidumbre)
  radiusEarthErr2: number | null; // pl_rade_err2 (-incertidumbre)
  radiusJupiter: number | null; // pl_radj
  massEarth: number | null; // pl_bmasse
  massEarthErr1: number | null; // pl_bmasse_err1 (+incertidumbre)
  massEarthErr2: number | null; // pl_bmasse_err2 (-incertidumbre)
  massJupiter: number | null; // pl_bmassj
  densityGCC: number | null; // calculado: 5.515 * massEarth / radiusEarth³
  gravityMS2: number | null; // calculado: 9.807 * massEarth / radiusEarth²
  equilibriumTempK: number | null; // pl_eqt
  equilibriumTempErr1: number | null; // pl_eqt_err1 (+incertidumbre)
  equilibriumTempErr2: number | null; // pl_eqt_err2 (-incertidumbre)
  insolationFlux: number | null; // pl_insol

  // Clasificación
  planetType: PlanetType; // derivado en backend
  discoveryMethod: DiscoveryMethod; // discoverymethod
  discoveryYear: number | null; // disc_year
  discoveryFacility: string | null; // disc_facility
  telescope: string | null; // no disponible en CSV; reservado para uso futuro

  // Estrella huésped
  stellarTempK: number | null; // st_teff
  stellarRadiusSun: number | null; // st_rad
  stellarMassSun: number | null; // st_mass
  stellarMetallicity: number | null; // st_met
  stellarAge: number | null; // no disponible en CSV; reservado para uso futuro

  // Posición
  rightAscension: number | null; // ra
  declination: number | null; // dec
  distanceParsec: number | null; // sy_dist

  // Habitabilidad (calculado en backend)
  habitabilityScore: number; // 0-100, ver sección algoritmo
  habitabilityClass: HabitabilityClass;

  // Estrella huésped — datos espectrales y fotométricos del CSV
  spectralType: string | null; // st_spectype — tipo espectral real (ej: "G8 III", "K0 V")
  stellarSurfaceGravity: number | null; // st_logg — log10(cm/s²)
  visualMagnitude: number | null; // sy_vmag — magnitud visual aparente (< 6 = visible a ojo desnudo)
  kMagnitude: number | null; // sy_kmag — magnitud en banda K infrarroja
  gaiaMagnitude: number | null; // sy_gaiamag — magnitud Gaia G-band

  // Flags científicos
  controversialFlag: boolean; // pl_controv_flag — descubrimiento debatido o no confirmado

  // Fechas de publicación
  lastUpdated: string | null; // rowupdate
  publicationDate: string | null; // pl_pubdate

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

export type StellarClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

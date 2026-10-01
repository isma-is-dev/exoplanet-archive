import { transformNasaData, NasaExoplanetRaw } from './exoplanet.transformer';

/** Builds a NASA `ps` table row with only the fields a test cares about. */
function nasaRow(overrides: Partial<NasaExoplanetRaw> = {}): NasaExoplanetRaw {
  return {
    pl_name: 'Kepler-186 f',
    hostname: 'Kepler-186',
    pl_letter: 'f',
    pl_orbper: 129.9,
    pl_orbpererr1: 0.02,
    pl_orbpererr2: -0.02,
    pl_orbsmax: 0.432,
    pl_orbeccen: 0.01,
    pl_rade: 1.17,
    pl_radeerr1: 0.03,
    pl_radeerr2: -0.02,
    pl_radj: 0.00937,
    pl_bmasse: 1.71,
    pl_bmasseerr1: 0.49,
    pl_bmasseerr2: -0.43,
    pl_bmassj: 0.00537,
    pl_eqt: 188,
    pl_eqterr1: 30,
    pl_eqterr2: -20,
    pl_insol: 1.06,
    pl_controv_flag: 0,
    discoverymethod: 'Transit',
    disc_year: 2014,
    disc_facility: 'Kepler',
    st_spectype: 'M1V',
    st_teff: 3788,
    st_rad: 0.52,
    st_mass: 0.51,
    st_met: 0.24,
    st_logg: 4.74,
    sy_vmag: 13.6,
    sy_kmag: 9.9,
    sy_gaiamag: 13.5,
    ra: 19.8,
    dec: 43.9,
    sy_dist: 178.5,
    sy_snum: 1,
    sy_pnum: 2,
    pl_refname: 'arXiv:1404.5292',
    rowupdate: '2024-01-02',
    pl_pubdate: '2014-05-01',
    ...overrides,
  };
}

describe('transformNasaData: identity and passthrough', () => {
  it('normalises the planet name into a url-safe id', () => {
    expect(transformNasaData(nasaRow({ pl_name: 'WASP-12 b' }), 1).id).toBe('wasp-12-b');
    expect(transformNasaData(nasaRow({ pl_name: 'K2-18 b' }), 1).id).toBe('k2-18-b');
    expect(transformNasaData(nasaRow({ pl_name: 'TOI-700 d' }), 1).id).toBe('toi-700-d');
  });

  it('strips characters that cannot appear in a route segment', () => {
    expect(transformNasaData(nasaRow({ pl_name: 'HAT-P-12 b' }), 1).id).toBe('hat-p-12-b');
  });

  it('keeps the archive index it was given', () => {
    expect(transformNasaData(nasaRow(), 4211).index).toBe(4211);
  });

  it('carries the discovery, position and provenance fields through unchanged', () => {
    const planet = transformNasaData(nasaRow(), 1);

    expect(planet.name).toBe('Kepler-186 f');
    expect(planet.hostStar).toBe('Kepler-186');
    expect(planet.letter).toBe('f');
    expect(planet.discoveryYear).toBe(2014);
    expect(planet.discoveryFacility).toBe('Kepler');
    expect(planet.rightAscension).toBe(19.8);
    expect(planet.declination).toBe(43.9);
    expect(planet.distanceParsec).toBe(178.5);
    expect(planet.referenceUrl).toBe('arXiv:1404.5292');
    expect(planet.lastUpdated).toBe('2024-01-02');
    expect(planet.publicationDate).toBe('2014-05-01');
    expect(planet.numberOfStarsInSystem).toBe(1);
    expect(planet.numberOfKnownPlanetsInSystem).toBe(2);
  });

  it('flags disputed planets from the controversy column', () => {
    expect(transformNasaData(nasaRow({ pl_controv_flag: 1 }), 1).controversialFlag).toBe(true);
    expect(transformNasaData(nasaRow({ pl_controv_flag: 0 }), 1).controversialFlag).toBe(false);
    expect(transformNasaData(nasaRow({ pl_controv_flag: null }), 1).controversialFlag).toBe(false);
  });

  it('marks the atmosphere as undetected rather than guessing', () => {
    expect(transformNasaData(nasaRow(), 1).hasAtmosphereData).toBe(false);
  });
});

describe('transformNasaData: uncertainty fields', () => {
  it('preserves the asymmetric 1σ/2σ uncertainties NASA publishes', () => {
    const planet = transformNasaData(nasaRow(), 1);

    expect(planet.orbitalPeriodErr1).toBe(0.02);
    expect(planet.orbitalPeriodErr2).toBe(-0.02);
    expect(planet.radiusEarthErr1).toBe(0.03);
    expect(planet.radiusEarthErr2).toBe(-0.02);
    expect(planet.massEarthErr1).toBe(0.49);
    expect(planet.massEarthErr2).toBe(-0.43);
    expect(planet.equilibriumTempErr1).toBe(30);
    expect(planet.equilibriumTempErr2).toBe(-20);
  });

  it('keeps missing uncertainties as null instead of zero', () => {
    const planet = transformNasaData(
      nasaRow({
        pl_orbpererr1: null,
        pl_orbpererr2: null,
        pl_radeerr1: null,
        pl_radeerr2: null,
        pl_bmasseerr1: null,
        pl_bmasseerr2: null,
        pl_eqterr1: null,
        pl_eqterr2: null,
      }),
      1
    );

    expect(planet.orbitalPeriodErr1).toBeNull();
    expect(planet.orbitalPeriodErr2).toBeNull();
    expect(planet.radiusEarthErr1).toBeNull();
    expect(planet.radiusEarthErr2).toBeNull();
    expect(planet.massEarthErr1).toBeNull();
    expect(planet.massEarthErr2).toBeNull();
    expect(planet.equilibriumTempErr1).toBeNull();
    expect(planet.equilibriumTempErr2).toBeNull();
  });

  it('never invents a value for a measurement the archive does not provide', () => {
    const planet = transformNasaData(nasaRow(), 1);

    // Not selected by the ADQL query.
    expect(planet.inclinationDeg).toBeNull();
    expect(planet.telescope).toBeNull();
    expect(planet.stellarAge).toBeNull();
  });
});

describe('transformNasaData: derived physics', () => {
  it('derives density in g/cm³ from mass and radius', () => {
    // 5.515 * 1.71 / 1.17³ = 5.888
    expect(transformNasaData(nasaRow(), 1).densityGCC).toBe(5.888);
  });

  it('derives surface gravity in m/s² from mass and radius', () => {
    // 9.807 * 1.71 / 1.17² = 12.25
    expect(transformNasaData(nasaRow(), 1).gravityMS2).toBe(12.25);
  });

  it('returns null density and gravity when the mass is unknown', () => {
    const planet = transformNasaData(nasaRow({ pl_bmasse: null }), 1);
    expect(planet.densityGCC).toBeNull();
    expect(planet.gravityMS2).toBeNull();
  });

  it('refuses to divide by a zero radius', () => {
    const planet = transformNasaData(nasaRow({ pl_rade: 0 }), 1);
    expect(planet.densityGCC).toBeNull();
    expect(planet.gravityMS2).toBeNull();
  });
});

describe('transformNasaData: planet type classification', () => {
  const typeOf = (overrides: Partial<NasaExoplanetRaw>) =>
    transformNasaData(nasaRow(overrides), 1).planetType;

  it('classifies by radius band', () => {
    expect(typeOf({ pl_rade: 0.8 })).toBe('rocky-terrestrial');
    expect(typeOf({ pl_rade: 1.5 })).toBe('super-earth');
    expect(typeOf({ pl_rade: 2.5 })).toBe('mini-neptune');
    expect(typeOf({ pl_rade: 4.5 })).toBe('neptunian');
  });

  it('calls a short-period giant a hot Jupiter', () => {
    expect(typeOf({ pl_rade: 11, pl_orbper: 3.5, pl_eqt: 1400 })).toBe('hot-jupiter');
  });

  it('calls a hot giant without a period a hot Jupiter anyway', () => {
    expect(typeOf({ pl_rade: 11, pl_orbper: null, pl_eqt: 1500 })).toBe('hot-jupiter');
  });

  it('calls a long-period cool giant a jovian', () => {
    expect(typeOf({ pl_rade: 11, pl_orbper: 4000, pl_eqt: 140 })).toBe('jovian');
  });

  it('estimates a radius from the mass when the radius is missing', () => {
    // M^0.55 for 1 M⊕ ≈ 1.0 R⊕ → rocky-terrestrial.
    expect(typeOf({ pl_rade: null, pl_bmasse: 1 })).toBe('rocky-terrestrial');
    // M^0.55 for 20 M⊕ ≈ 5.6 R⊕ → neptunian.
    expect(typeOf({ pl_rade: null, pl_bmasse: 20 })).toBe('neptunian');
  });

  it('returns unknown when the archive knows neither radius nor mass', () => {
    expect(typeOf({ pl_rade: null, pl_bmasse: null })).toBe('unknown');
  });
});

describe('transformNasaData: discovery methods', () => {
  const methodOf = (method: string) =>
    transformNasaData(nasaRow({ discoverymethod: method }), 1).discoveryMethod;

  it('maps the archive vocabulary onto the app vocabulary', () => {
    expect(methodOf('Transit')).toBe('Transit');
    expect(methodOf('Radial Velocity')).toBe('Radial Velocity');
    expect(methodOf('Direct Imaging')).toBe('Direct Imaging');
    expect(methodOf('Microlensing')).toBe('Microlensing');
    expect(methodOf('Astrometry')).toBe('Astrometry');
    expect(methodOf('Transit Timing Variations')).toBe('Transit Timing Variations');
  });

  it('buckets any method the app does not model as Other', () => {
    expect(methodOf('Pulsar Timing')).toBe('Other');
    expect(methodOf('Disk Kinematics')).toBe('Other');
  });
});

describe('transformNasaData: habitability', () => {
  const habitabilityOf = (overrides: Partial<NasaExoplanetRaw>) => {
    const planet = transformNasaData(nasaRow(overrides), 1);
    return { score: planet.habitabilityScore, class: planet.habitabilityClass };
  };

  it('scores a temperate Earth-sized world in the habitable band', () => {
    // Earth-like: 255K, 1 R⊕, 1 M⊕, 1 S⊕ → a high score.
    const { score, class: habitabilityClass } = habitabilityOf({
      pl_rade: 1,
      pl_bmasse: 1,
      pl_eqt: 255,
      pl_insol: 1,
    });
    expect(score).toBeGreaterThanOrEqual(60);
    expect(habitabilityClass).toBe('potentially-habitable');
  });

  it('marks giants and hot Jupiters as uninhabitable whatever the score', () => {
    expect(habitabilityOf({ pl_rade: 11, pl_orbper: 3, pl_eqt: 1600 }).class).toBe(
      'uninhabitable'
    );
    expect(habitabilityOf({ pl_rade: 11, pl_orbper: 5000, pl_eqt: 140 }).class).toBe(
      'uninhabitable'
    );
  });

  it('returns an unknown class when nothing was measured', () => {
    const { score, class: habitabilityClass } = habitabilityOf({
      pl_rade: null,
      pl_bmasse: null,
      pl_eqt: null,
      pl_insol: null,
    });
    expect(score).toBe(0);
    expect(habitabilityClass).toBe('unknown');
  });

  it('keeps the score inside 0–100 for extreme inputs', () => {
    const cold = habitabilityOf({ pl_rade: 30, pl_bmasse: 1000, pl_eqt: 5, pl_insol: 0 });
    const hot = habitabilityOf({ pl_rade: 0.1, pl_bmasse: 0.01, pl_eqt: 3000, pl_insol: 5000 });

    for (const { score } of [cold, hot]) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('ranks a temperate Earth-like world above a hot Jupiter', () => {
    const temperate = habitabilityOf({ pl_rade: 1, pl_bmasse: 1, pl_eqt: 255, pl_insol: 1 });
    const scorching = habitabilityOf({ pl_rade: 11, pl_orbper: 2, pl_eqt: 2000, pl_insol: 3000 });
    expect(temperate.score).toBeGreaterThan(scorching.score);
  });
});

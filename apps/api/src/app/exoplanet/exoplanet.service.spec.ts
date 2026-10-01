import { ConfigService } from '@nestjs/config';
import {
  Exoplanet,
  ExoplanetFilters,
  SortField,
  SortState,
} from '@exodex/shared-types';
import { ExoplanetService } from './exoplanet.service';

/**
 * The service normally loads its data from the NASA TAP endpoint or a disk
 * cache. These tests inject a fixture straight into the in-memory index so
 * they exercise the query logic (filters, sort, pagination, result cache)
 * without touching the network.
 */
function newService(): ExoplanetService {
  return new ExoplanetService(new ConfigService({}));
}

function injectPlanets(service: ExoplanetService, planets: Exoplanet[]): void {
  const internals = service as unknown as {
    exoplanets: Exoplanet[];
    exoplanetMap: Map<string, Exoplanet>;
    lastUpdated: Date;
    datasetState: string;
    buildSearchIndex: () => void;
  };
  internals.exoplanets = planets;
  internals.exoplanetMap = new Map(planets.map((p) => [p.id, p]));
  internals.lastUpdated = new Date();
  internals.datasetState = 'ready';
  internals.buildSearchIndex();
}

function makeService(planets: Exoplanet[]): ExoplanetService {
  const service = newService();
  injectPlanets(service, planets);
  return service;
}

function cacheOf(service: ExoplanetService): Map<string, { timestamp: number }> {
  return (
    service as unknown as {
      filterResultCache: Map<string, { timestamp: number }>;
    }
  ).filterResultCache;
}

let nextId = 0;
function planet(overrides: Partial<Exoplanet> = {}): Exoplanet {
  nextId += 1;
  const id = `p${nextId}`;
  return {
    id,
    name: overrides.name ?? `Planet ${nextId}`,
    index: overrides.index ?? nextId,
    hostStar: overrides.hostStar ?? 'Kepler-186',
    letter: 'b',
    orbitalPeriodDays: 100,
    orbitalPeriodErr1: null,
    orbitalPeriodErr2: null,
    semiMajorAxisAU: 0.4,
    eccentricity: 0,
    inclinationDeg: null,
    radiusEarth: 1,
    radiusEarthErr1: null,
    radiusEarthErr2: null,
    radiusJupiter: 0.01,
    massEarth: 1,
    massEarthErr1: null,
    massEarthErr2: null,
    massJupiter: 0.003,
    densityGCC: 5.5,
    gravityMS2: 9.8,
    equilibriumTempK: 255,
    equilibriumTempErr1: null,
    equilibriumTempErr2: null,
    insolationFlux: 1,
    planetType: 'rocky-terrestrial',
    discoveryMethod: 'Transit',
    discoveryYear: 2015,
    discoveryFacility: 'Kepler',
    telescope: null,
    stellarTempK: 5778,
    stellarRadiusSun: 1,
    stellarMassSun: 1,
    stellarMetallicity: 0,
    stellarAge: null,
    rightAscension: null,
    declination: null,
    distanceParsec: 10,
    habitabilityScore: 70,
    habitabilityClass: 'potentially-habitable',
    spectralType: 'G2V',
    stellarSurfaceGravity: 4.4,
    visualMagnitude: null,
    kMagnitude: null,
    gaiaMagnitude: null,
    controversialFlag: false,
    lastUpdated: null,
    publicationDate: null,
    referenceUrl: null,
    hasAtmosphereData: false,
    numberOfStarsInSystem: 1,
    numberOfKnownPlanetsInSystem: 1,
    ...overrides,
  };
}

const noFilters: ExoplanetFilters = {
  planetTypes: [],
  discoveryMethods: [],
  habitabilityClasses: [],
  stellarClasses: [],
  discoveryYearRange: null,
  radiusEarthRange: null,
  massEarthRange: null,
  equilibriumTempKRange: null,
  searchQuery: '',
};

const filters = (overrides: Partial<ExoplanetFilters> = {}): ExoplanetFilters => ({
  ...noFilters,
  ...overrides,
});

const byIndex: SortState = { field: 'index', direction: 'asc' };

describe('ExoplanetService: dataset availability', () => {
  it('is unavailable while no data has been loaded, so the API must not answer 200', () => {
    const service = newService();
    expect(service.isDatasetAvailable()).toBe(false);
    expect(service.getDatasetState()).toBe('loading');
  });

  it('is unavailable after an upstream failure, and keeps the reason', () => {
    const service = newService();
    const internals = service as unknown as { datasetState: string; lastError: string | null };
    internals.datasetState = 'error';
    internals.lastError = 'ETIMEDOUT';

    expect(service.isDatasetAvailable()).toBe(false);
    expect(service.getDatasetState()).toBe('error');
    expect(service.getDatasetError()).toBe('ETIMEDOUT');
  });

  it('reports cache status even when the dataset is down', () => {
    const service = newService();
    const status = service.getCacheStatus();

    expect(status.totalPlanets).toBe(0);
    expect(status.cacheAge).toBe(-1);
    expect(status.state).toBe('loading');
  });
});

describe('ExoplanetService: filtering', () => {
  const dataset = [
    planet({ name: 'Alpha b', planetType: 'rocky-terrestrial', discoveryMethod: 'Transit', stellarTempK: 3500, radiusEarth: 1, discoveryYear: 2010, habitabilityClass: 'potentially-habitable' }),
    planet({ name: 'Beta b', planetType: 'jovian', discoveryMethod: 'Radial Velocity', stellarTempK: 6000, radiusEarth: 11, discoveryYear: 2015, habitabilityClass: 'uninhabitable' }),
    planet({ name: 'Gamma b', planetType: 'neptunian', discoveryMethod: 'Transit', stellarTempK: 9000, radiusEarth: 4, discoveryYear: 2020, habitabilityClass: 'uninhabitable' }),
  ];

  it('returns everything when no filter is active', () => {
    const service = makeService(dataset);
    expect(service.getAll(filters(), byIndex, 1, 50).total).toBe(3);
  });

  it('filters by planet type', () => {
    const service = makeService(dataset);
    const result = service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 50);
    expect(result.data.map((p) => p.name)).toEqual(['Beta b']);
  });

  it('treats multiple selected types as a union', () => {
    const service = makeService(dataset);
    const result = service.getAll(
      filters({ planetTypes: ['jovian', 'neptunian'] }),
      byIndex,
      1,
      50
    );
    expect(result.data.map((p) => p.name).sort()).toEqual(['Beta b', 'Gamma b']);
  });

  it('filters by discovery method', () => {
    const service = makeService(dataset);
    const result = service.getAll(
      filters({ discoveryMethods: ['Radial Velocity'] }),
      byIndex,
      1,
      50
    );
    expect(result.data.map((p) => p.name)).toEqual(['Beta b']);
  });

  it('filters by habitability class', () => {
    const service = makeService(dataset);
    const result = service.getAll(
      filters({ habitabilityClasses: ['uninhabitable'] }),
      byIndex,
      1,
      50
    );
    expect(result.data).toHaveLength(2);
  });

  it('derives the stellar class from the spectral type when present', () => {
    const service = makeService([
      planet({ name: 'Red b', spectralType: 'M1V', stellarTempK: null }),
      planet({ name: 'Blue b', spectralType: 'A0V', stellarTempK: null }),
    ]);
    expect(service.getAll(filters({ stellarClasses: ['M'] }), byIndex, 1, 50).data.map((p) => p.name)).toEqual(['Red b']);
    expect(service.getAll(filters({ stellarClasses: ['A'] }), byIndex, 1, 50).data.map((p) => p.name)).toEqual(['Blue b']);
  });

  it('falls back to the temperature bands when the spectral type is missing', () => {
    const service = makeService([
      planet({ name: 'Cool b', spectralType: null, stellarTempK: 3000 }),
      planet({ name: 'Hot b', spectralType: null, stellarTempK: 20000 }),
    ]);
    expect(service.getAll(filters({ stellarClasses: ['M'] }), byIndex, 1, 50).data.map((p) => p.name)).toEqual(['Cool b']);
    expect(service.getAll(filters({ stellarClasses: ['B'] }), byIndex, 1, 50).data.map((p) => p.name)).toEqual(['Hot b']);
  });

  it('applies the discovery-year range inclusively', () => {
    const service = makeService(dataset);
    const result = service.getAll(filters({ discoveryYearRange: [2015, 2020] }), byIndex, 1, 50);
    expect(result.data.map((p) => p.name).sort()).toEqual(['Beta b', 'Gamma b']);
  });

  it('applies the radius range inclusively', () => {
    const service = makeService(dataset);
    const result = service.getAll(filters({ radiusEarthRange: [1, 4] }), byIndex, 1, 50);
    expect(result.data.map((p) => p.name).sort()).toEqual(['Alpha b', 'Gamma b']);
  });

  it('applies the mass and temperature ranges', () => {
    const service = makeService([
      planet({ name: 'Light', massEarth: 0.5, equilibriumTempK: 200 }),
      planet({ name: 'Heavy', massEarth: 8, equilibriumTempK: 900 }),
    ]);
    expect(service.getAll(filters({ massEarthRange: [0, 1] }), byIndex, 1, 50).data.map((p) => p.name)).toEqual(['Light']);
    expect(service.getAll(filters({ equilibriumTempKRange: [800, 1000] }), byIndex, 1, 50).data.map((p) => p.name)).toEqual(['Heavy']);
  });

  it('searches planet names and host star names', () => {
    const service = makeService([
      planet({ name: 'Kepler-186 f', hostStar: 'Kepler-186' }),
      planet({ name: 'TRAPPIST-1 e', hostStar: 'TRAPPIST-1' }),
    ]);
    expect(service.getAll(filters({ searchQuery: 'trappist' }), byIndex, 1, 50).data.map((p) => p.name)).toEqual(['TRAPPIST-1 e']);
  });

  it('intersects multi-word searches', () => {
    const service = makeService([
      planet({ name: 'Kepler-186 f', hostStar: 'Kepler-186' }),
      planet({ name: 'TRAPPIST-1 e', hostStar: 'TRAPPIST-1' }),
    ]);
    expect(service.getAll(filters({ searchQuery: 'kepler 186' }), byIndex, 1, 50).data).toHaveLength(1);
    expect(service.getAll(filters({ searchQuery: 'kepler trappist' }), byIndex, 1, 50).data).toHaveLength(0);
  });

  it('is case-insensitive and ignores surrounding whitespace', () => {
    const service = makeService([planet({ name: 'Kepler-186 f', hostStar: 'Kepler-186' })]);
    expect(service.getAll(filters({ searchQuery: '  KEPLER  ' }), byIndex, 1, 50).data).toHaveLength(1);
  });

  it('combines every active filter', () => {
    const service = makeService(dataset);
    const result = service.getAll(
      filters({
        planetTypes: ['rocky-terrestrial'],
        discoveryMethods: ['Transit'],
        discoveryYearRange: [2000, 2012],
      }),
      byIndex,
      1,
      50
    );
    expect(result.data.map((p) => p.name)).toEqual(['Alpha b']);
  });
});

describe('ExoplanetService: sorting', () => {
  const dataset = () => [
    planet({ name: 'Middle', index: 2, radiusEarth: 5, discoveryYear: 2010 }),
    planet({ name: 'Small', index: 3, radiusEarth: 1, discoveryYear: 2020 }),
    planet({ name: 'Large', index: 1, radiusEarth: 11, discoveryYear: 2015 }),
  ];

  it('sorts numbers ascending and descending', () => {
    const service = makeService(dataset());
    expect(
      service.getAll(filters(), { field: 'radiusEarth', direction: 'asc' }, 1, 50).data.map((p) => p.radiusEarth)
    ).toEqual([1, 5, 11]);
    expect(
      service.getAll(filters(), { field: 'radiusEarth', direction: 'desc' }, 1, 50).data.map((p) => p.radiusEarth)
    ).toEqual([11, 5, 1]);
  });

  it('sorts names alphabetically', () => {
    const service = makeService(dataset());
    expect(
      service.getAll(filters(), { field: 'name', direction: 'asc' }, 1, 50).data.map((p) => p.name)
    ).toEqual(['Large', 'Middle', 'Small']);
  });

  it('pushes unknown values to the end, in both directions', () => {
    const service = makeService([
      planet({ name: 'Measured', radiusEarth: 4 }),
      planet({ name: 'Unknown', radiusEarth: null }),
    ]);
    expect(
      service.getAll(filters(), { field: 'radiusEarth', direction: 'asc' }, 1, 50).data.map((p) => p.name)
    ).toEqual(['Measured', 'Unknown']);
    expect(
      service.getAll(filters(), { field: 'radiusEarth', direction: 'desc' }, 1, 50).data.map((p) => p.name)
    ).toEqual(['Measured', 'Unknown']);
  });

  it('falls back to the archive index for an unknown sort field', () => {
    const service = makeService(dataset());
    const result = service.getAll(filters(), { field: 'nonsense' as SortField, direction: 'asc' }, 1, 50);
    expect(result.data.map((p) => p.index)).toEqual([1, 2, 3]);
  });

  it('does not mutate the stored array while sorting', () => {
    const rows = dataset();
    const service = makeService(rows);
    service.getAll(filters(), { field: 'radiusEarth', direction: 'desc' }, 1, 50);
    expect(rows.map((p) => p.index)).toEqual([2, 3, 1]);
  });
});

describe('ExoplanetService: pagination', () => {
  const many = () => Array.from({ length: 25 }, () => planet());

  it('returns the requested slice and the unpaginated total', () => {
    const service = makeService(many());
    const all = service.getAll(filters(), byIndex, 1, 100).data;
    const page2 = service.getAll(filters(), byIndex, 2, 10);

    expect(page2.data).toHaveLength(10);
    expect(page2.total).toBe(25);
    expect(page2.data).toEqual(all.slice(10, 20));
  });

  it('returns a short final page', () => {
    const service = makeService(many());
    expect(service.getAll(filters(), byIndex, 3, 10).data).toHaveLength(5);
  });

  it('returns an empty page past the end instead of failing', () => {
    const service = makeService(many());
    const result = service.getAll(filters(), byIndex, 99, 10);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(25);
  });

  it('paginates over the filtered set, not the whole dataset', () => {
    const service = makeService([
      ...Array.from({ length: 5 }, () => planet({ planetType: 'jovian' })),
      ...Array.from({ length: 5 }, () => planet({ planetType: 'rocky-terrestrial' })),
    ]);
    const result = service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 2);
    expect(result.total).toBe(5);
    expect(result.data).toHaveLength(2);
  });
});

describe('ExoplanetService: result cache', () => {
  const dataset = () => [
    planet({ name: 'A', planetType: 'jovian' }),
    planet({ name: 'B', planetType: 'neptunian' }),
  ];

  it('serves a repeated query from the cache instead of rescanning', () => {
    const rows = dataset();
    const service = makeService(rows);

    expect(service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 10).total).toBe(1);
    expect(cacheOf(service).size).toBe(1);

    // A planet that appears after the query was cached must not show up in
    // the cached answer, which proves the second call did not rescan.
    injectPlanets(service, [...rows, planet({ name: 'Late arrival', planetType: 'jovian' })]);

    const repeat = service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 10);
    expect(repeat.total).toBe(1);
    expect(repeat.data.map((p) => p.name)).toEqual(['A']);

    // A different filter is not cached, so it does see the new planet.
    const fresh = service.getAll(filters({ planetTypes: ['neptunian'] }), byIndex, 1, 10);
    expect(fresh.total).toBe(1);
  });

  it('paginates over the cached filtered set, not just the first page', () => {
    const service = makeService(
      Array.from({ length: 10 }, () => planet({ planetType: 'jovian' }))
    );

    const first = service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 5);
    const second = service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 2, 5);

    // The cache key excludes pagination, so page 2 must continue from page 1.
    expect(first.data.map((p) => p.id)).not.toEqual(second.data.map((p) => p.id));
    expect(second.data).toHaveLength(5);
    expect(second.total).toBe(10);
  });

  it('treats differently ordered filter lists as the same query', () => {
    const service = makeService(dataset());
    const a = service.getAll(
      filters({ planetTypes: ['jovian', 'neptunian'] }),
      byIndex,
      1,
      10
    );
    const b = service.getAll(
      filters({ planetTypes: ['neptunian', 'jovian'] }),
      byIndex,
      1,
      10
    );
    expect(a.data.map((p) => p.id).sort()).toEqual(b.data.map((p) => p.id).sort());
    expect(cacheOf(service).size).toBe(1);
  });

  it('keys the cache on the sort order as well as the filters', () => {
    const service = makeService(dataset());
    const cache = cacheOf(service);

    service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 10);
    service.getAll(filters({ planetTypes: ['neptunian'] }), byIndex, 1, 10);
    service.getAll(filters({ planetTypes: ['jovian'] }), { field: 'name', direction: 'asc' }, 1, 10);

    expect(cache.size).toBe(3);
  });

  it('never grows past the configured cache bound', () => {
    const service = makeService(dataset());
    const cache = cacheOf(service);

    for (let i = 0; i < 60; i++) {
      service.getAll(filters({ searchQuery: `query-${i}` }), byIndex, 1, 10);
    }

    expect(cache.size).toBeLessThanOrEqual(50);
  });

  it('expires cache entries once the TTL has passed', () => {
    jest.useFakeTimers();
    try {
      const service = makeService(dataset());
      const cache = cacheOf(service);

      service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 10);
      expect(cache.size).toBe(1);
      const storedAt = [...cache.values()][0].timestamp;

      // Still inside the 30s TTL: the entry is reused and left untouched.
      jest.advanceTimersByTime(10_000);
      service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 10);
      expect([...cache.values()][0].timestamp).toBe(storedAt);

      // Past the TTL: the entry is dropped and rewritten from a fresh scan.
      jest.advanceTimersByTime(21_000);
      service.getAll(filters({ planetTypes: ['jovian'] }), byIndex, 1, 10);
      expect(cache.size).toBe(1);
      expect([...cache.values()][0].timestamp).toBeGreaterThan(storedAt);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('ExoplanetService: stats and lookups', () => {
  it('counts planets by type and discovery method', () => {
    const service = makeService([
      planet({ planetType: 'jovian', discoveryMethod: 'Transit' }),
      planet({ planetType: 'jovian', discoveryMethod: 'Transit' }),
      planet({ planetType: 'neptunian', discoveryMethod: 'Radial Velocity' }),
    ]);
    const stats = service.getStats();

    expect(stats.totalCount).toBe(3);
    expect(stats.typeDistribution.jovian).toBe(2);
    expect(stats.typeDistribution.neptunian).toBe(1);
    expect(stats.methodDistribution.Transit).toBe(2);
  });

  it('reports the observed year and radius ranges', () => {
    const service = makeService([
      planet({ discoveryYear: 2009, radiusEarth: 0.8 }),
      planet({ discoveryYear: 2021, radiusEarth: 14 }),
    ]);
    const stats = service.getStats();

    expect(stats.yearRange).toEqual([2009, 2021]);
    expect(stats.radiusRange).toEqual([0.8, 14]);
  });

  it('looks a planet up by its normalised id', () => {
    const service = makeService([planet({ id: 'kepler-186-f', name: 'Kepler-186 f' })]);
    expect(service.getById('kepler-186-f')?.name).toBe('Kepler-186 f');
    expect(service.getById('does-not-exist')).toBeUndefined();
  });
});

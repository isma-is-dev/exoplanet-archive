import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Exoplanet, ExoplanetFilters, SortState } from '@exodex/shared-types';
import { ExoplanetController } from './exoplanet.controller';
import { ExoplanetQueryDto } from './dto/exoplanet-query.dto';

/**
 * The controller is a thin adapter over the service. The important behaviour is
 * the request contract: page-size clamping, and refusing to answer 200 while
 * the NASA dataset is missing (an empty list would read as "no exoplanets").
 */
const DATASET: Exoplanet[] = [
  {
    id: 'kepler-186-f',
    name: 'Kepler-186 f',
    index: 1,
    hostStar: 'Kepler-186',
    letter: 'f',
    orbitalPeriodDays: 129.9,
    orbitalPeriodErr1: null,
    orbitalPeriodErr2: null,
    semiMajorAxisAU: 0.43,
    eccentricity: 0.01,
    inclinationDeg: null,
    radiusEarth: 1.17,
    radiusEarthErr1: null,
    radiusEarthErr2: null,
    radiusJupiter: 0.01,
    massEarth: 1.71,
    massEarthErr1: null,
    massEarthErr2: null,
    massJupiter: 0.005,
    densityGCC: 5.89,
    gravityMS2: 12.25,
    equilibriumTempK: 188,
    equilibriumTempErr1: null,
    equilibriumTempErr2: null,
    insolationFlux: 1.06,
    planetType: 'super-earth',
    discoveryMethod: 'Transit',
    discoveryYear: 2014,
    discoveryFacility: 'Kepler',
    telescope: null,
    stellarTempK: 3788,
    stellarRadiusSun: 0.52,
    stellarMassSun: 0.51,
    stellarMetallicity: 0.24,
    stellarAge: null,
    rightAscension: null,
    declination: null,
    distanceParsec: 178.5,
    habitabilityScore: 40,
    habitabilityClass: 'marginal',
    spectralType: 'M1V',
    stellarSurfaceGravity: 4.74,
    visualMagnitude: null,
    kMagnitude: null,
    gaiaMagnitude: null,
    controversialFlag: false,
    lastUpdated: null,
    publicationDate: null,
    referenceUrl: null,
    hasAtmosphereData: false,
    numberOfStarsInSystem: 1,
    numberOfKnownPlanetsInSystem: 2,
  },
];

/** Minimal stand-in for the service that records what the controller asked for. */
function fakeService(overrides: Record<string, unknown> = {}) {
  const calls: { filters: ExoplanetFilters; sort: SortState; page: number; pageSize: number }[] = [];
  return {
    calls,
    service: {
      getAll: (
        filters: ExoplanetFilters,
        sort: SortState,
        page: number,
        pageSize: number
      ) => {
        calls.push({ filters, sort, page, pageSize });
        return { data: DATASET, total: DATASET.length };
      },
      getById: (id: string) => DATASET.find((p) => p.id === id),
      getStats: () => ({
        totalCount: DATASET.length,
        typeDistribution: {},
        methodDistribution: {},
        yearRange: [2014, 2014] as [number, number],
        radiusRange: [1.17, 1.17] as [number, number],
      }),
      getCacheStatus: () => ({
        lastUpdated: new Date('2026-03-28T02:51:33Z'),
        totalPlanets: DATASET.length,
        cacheAge: 1000,
        state: 'ready',
        lastError: null,
      }),
      isDatasetAvailable: () => true,
      getDatasetState: () => 'ready',
      getDatasetError: () => null,
      ...overrides,
    } as unknown as ConstructorParameters<typeof ExoplanetController>[0],
  };
}

const query = (values: Partial<ExoplanetQueryDto> = {}) => values as ExoplanetQueryDto;

describe('ExoplanetController.getAll', () => {
  it('returns the paginated envelope with the computed total page count', () => {
    const { service } = fakeService();
    const result = new ExoplanetController(service).getAll(query({ pageSize: 1 }));

    expect(result).toEqual({
      data: DATASET,
      total: 1,
      page: 1,
      pageSize: 1,
      totalPages: 1,
    });
  });

  it('clamps pageSize to the 96 row maximum', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(query({ pageSize: 5000 }));
    expect(calls[0].pageSize).toBe(96);
  });

  it('clamps pageSize to at least one row', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(query({ pageSize: 0 }));
    expect(calls[0].pageSize).toBe(1);
  });

  it('defaults to page 1 and a page size of 48', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(query());
    expect(calls[0]).toMatchObject({ page: 1, pageSize: 48 });
  });

  it('never lets the page fall below one', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(query({ page: -5 }));
    expect(calls[0].page).toBe(1);
  });

  it('parses comma-separated list filters into arrays', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(
      query({ types: 'jovian,neptunian', methods: 'Transit', habitability: 'marginal', stellarClasses: 'M' })
    );

    expect(calls[0].filters.planetTypes).toEqual(['jovian', 'neptunian']);
    expect(calls[0].filters.discoveryMethods).toEqual(['Transit']);
    expect(calls[0].filters.habitabilityClasses).toEqual(['marginal']);
    expect(calls[0].filters.stellarClasses).toEqual(['M']);
  });

  it('leaves absent list filters empty rather than undefined', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(query());
    expect(calls[0].filters.planetTypes).toEqual([]);
    expect(calls[0].filters.discoveryYearRange).toBeNull();
    expect(calls[0].filters.searchQuery).toBe('');
  });

  it('only builds a year range when both bounds are present', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(query({ minYear: 2010 }));
    expect(calls[0].filters.discoveryYearRange).toBeNull();

    new ExoplanetController(service).getAll(query({ minYear: 2010, maxYear: 2020 }));
    expect(calls[1].filters.discoveryYearRange).toEqual([2010, 2020]);
  });

  it('only builds a radius range when both bounds are present', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(query({ minRadius: 0.5, maxRadius: 2 }));
    expect(calls[0].filters.radiusEarthRange).toEqual([0.5, 2]);
  });

  it('defaults the sort to the archive index, ascending', () => {
    const { service, calls } = fakeService();
    new ExoplanetController(service).getAll(query());
    expect(calls[0].sort).toEqual({ field: 'index', direction: 'asc' });
  });
});

describe('ExoplanetController: honest responses when the dataset is down', () => {
  const downService = (state: 'loading' | 'error', error: string | null = null) =>
    fakeService({
      isDatasetAvailable: () => false,
      getDatasetState: () => state,
      getDatasetError: () => error,
    });

  it('answers 503 instead of an empty list while the data is still loading', () => {
    const { service } = downService('loading');
    const controller = new ExoplanetController(service);

    expect(() => controller.getAll(query())).toThrow(ServiceUnavailableException);
    try {
      controller.getAll(query());
    } catch (thrown) {
      const response = (thrown as ServiceUnavailableException).getResponse();
      expect(response).toMatchObject({ statusCode: 503, datasetState: 'loading' });
      expect(String((response as { message: string }).message)).toContain('still loading');
    }
  });

  it('answers 503 with the upstream reason after a failed fetch', () => {
    const { service } = downService('error', 'ETIMEDOUT exoplanetarchive.ipac.caltech.edu');
    const controller = new ExoplanetController(service);

    try {
      controller.getAll(query());
      throw new Error('expected a 503');
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(ServiceUnavailableException);
      const response = (thrown as ServiceUnavailableException).getResponse() as { message: string };
      expect(response.message).toContain('ETIMEDOUT');
    }
  });

  it('answers 503 for stats rather than zeroes', () => {
    const { service } = downService('error', 'boom');
    expect(() => new ExoplanetController(service).getStats()).toThrow(
      ServiceUnavailableException
    );
  });

  it('answers 503 for a single planet rather than a misleading 404', () => {
    const { service } = downService('loading');
    expect(() => new ExoplanetController(service).getById('kepler-186-f')).toThrow(
      ServiceUnavailableException
    );
  });

  it('keeps the status endpoint reachable so clients can diagnose the outage', () => {
    const { service } = downService('error', 'boom');
    const status = new ExoplanetController(service).getStatus();
    expect(status.state).toBe('ready');
  });
});

describe('ExoplanetController.getById', () => {
  it('returns the planet when the id is known', () => {
    const { service } = fakeService();
    expect(new ExoplanetController(service).getById('kepler-186-f').name).toBe(
      'Kepler-186 f'
    );
  });

  it('answers 404 for an unknown id', () => {
    const { service } = fakeService();
    expect(() => new ExoplanetController(service).getById('nope')).toThrow(
      NotFoundException
    );
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ExoplanetFilters, SortState } from '@exodex/shared-types';
import { MOCK_DATA_ENABLED } from '../config/mock-data.config';
import { MOCK_DATA_OPT_IN_KEY, ExoplanetApiService } from './exoplanet-api.service';

const filters: ExoplanetFilters = {
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

const sort: SortState = { field: 'index', direction: 'asc' };

function makeService() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    service: TestBed.inject(ExoplanetApiService),
    http: TestBed.inject(HttpTestingController),
  };
}

const listUrl = (req: { url: string }) => req.url.endsWith('/exoplanets');

describe('development build: mock data is available but never implicit', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('compiles the mock dataset into non-production builds', () => {
    expect(MOCK_DATA_ENABLED).toBe(true);
  });

  it('does not fall back to the mock dataset without an explicit opt-in', async () => {
    const { service, http } = makeService();

    const result = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush('boom', { status: 503, statusText: 'Service Unavailable' });

    // No opt-in: the failure is surfaced, not papered over with fake planets.
    await expect(result).rejects.toBeDefined();
    expect(service.dataState()).toBe('degraded');
  });

  it('serves the mock dataset once the developer opts in', async () => {
    localStorage.setItem(MOCK_DATA_OPT_IN_KEY, 'true');
    const { service, http } = makeService();

    const result = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush('boom', { status: 503, statusText: 'Service Unavailable' });

    const response = await result;
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty('name');
    expect(service.dataState()).toBe('mock');
    expect(service.isUsingMock()).toBe(true);
  });

  it('warns loudly when it serves fabricated data', async () => {
    localStorage.setItem(MOCK_DATA_OPT_IN_KEY, 'true');
    const { service, http } = makeService();

    const result = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush('boom', { status: 503, statusText: 'Service Unavailable' });
    await result;

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('DEVELOPMENT-ONLY mock dataset')
    );
  });

  it('ignores an opt-in set to anything other than "true"', async () => {
    localStorage.setItem(MOCK_DATA_OPT_IN_KEY, 'yes');
    const { service, http } = makeService();

    const result = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush('boom', { status: 503, statusText: 'Service Unavailable' });

    await expect(result).rejects.toBeDefined();
    expect(service.dataState()).toBe('degraded');
  });

  it('prefers real data over the mock dataset', async () => {
    localStorage.setItem(MOCK_DATA_OPT_IN_KEY, 'true');
    const { service, http } = makeService();

    const result = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush({
      data: [{ id: 'kepler-186-f', name: 'Kepler-186 f' }],
      total: 1,
      page: 1,
      pageSize: 48,
      totalPages: 1,
    });

    await expect(result).resolves.toMatchObject({ total: 1 });
    expect(service.dataState()).toBe('live');
  });
});

describe('ExoplanetApiService: request building and caching', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => localStorage.clear());

  it('translates every filter into a query parameter', () => {
    const { service, http } = makeService();

    service
      .getExoplanets$(
        {
          ...filters,
          searchQuery: ' kepler ',
          planetTypes: ['jovian', 'neptunian'],
          habitabilityClasses: ['marginal'],
          discoveryMethods: ['Transit'],
          discoveryYearRange: [2010, 2020],
          radiusEarthRange: [0.5, 3],
          stellarClasses: ['M'],
        },
        { field: 'radiusEarth', direction: 'desc' },
        3,
        24
      )
      .subscribe();

    const pending = http.expectOne(listUrl);
    const { params } = pending.request;
    expect(params.get('q')).toBe('kepler');
    expect(params.get('types')).toBe('jovian,neptunian');
    expect(params.get('habitability')).toBe('marginal');
    expect(params.get('methods')).toBe('Transit');
    expect(params.get('minYear')).toBe('2010');
    expect(params.get('maxYear')).toBe('2020');
    expect(params.get('minRadius')).toBe('0.5');
    expect(params.get('maxRadius')).toBe('3');
    expect(params.get('stellarClasses')).toBe('M');
    expect(params.get('sort')).toBe('radiusEarth');
    expect(params.get('order')).toBe('desc');
    expect(params.get('page')).toBe('3');
    expect(params.get('pageSize')).toBe('24');

    pending.flush({ data: [], total: 0, page: 3, pageSize: 24, totalPages: 0 });
    http.verify();
  });

  it('omits parameters for filters that are not active', () => {
    const { service, http } = makeService();

    service.getExoplanets$(filters, sort, 1, 48).subscribe();

    const pending = http.expectOne(listUrl);
    for (const key of ['q', 'types', 'habitability', 'methods', 'minYear', 'maxYear', 'minRadius', 'maxRadius', 'stellarClasses']) {
      expect(pending.request.params.has(key)).toBe(false);
    }

    pending.flush({ data: [], total: 0, page: 1, pageSize: 48, totalPages: 0 });
    http.verify();
  });

  it('answers a repeated query from the in-memory cache', async () => {
    const { service, http } = makeService();

    const first = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush({ data: [{ id: 'a', name: 'A' }], total: 1, page: 1, pageSize: 48, totalPages: 1 });
    await first;

    // No second HTTP request: the second call is served from the cache.
    await expect(
      firstValueFrom(service.getExoplanets$(filters, sort, 1, 48))
    ).resolves.toMatchObject({ total: 1 });
    http.verify();
  });

  it('does not cache a failed request', async () => {
    const { service, http } = makeService();

    const first = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush('boom', { status: 503, statusText: 'x' });
    await expect(first).rejects.toBeDefined();

    const second = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush({ data: [], total: 0, page: 1, pageSize: 48, totalPages: 0 });
    await expect(second).resolves.toMatchObject({ total: 0 });
  });

  it('clears the cache and the degraded flag on demand', async () => {
    const { service, http } = makeService();

    const first = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne(listUrl).flush('boom', { status: 503, statusText: 'x' });
    await expect(first).rejects.toBeDefined();
    expect(service.isDegraded()).toBe(true);

    service.clearCache();
    expect(service.isDegraded()).toBe(false);
    expect(service.dataState()).toBe('live');
  });

  it('caches the statistics response too', async () => {
    const { service, http } = makeService();
    const payload = { totalCount: 6372, typeDistribution: {}, methodDistribution: {}, yearRange: [1992, 2024] as [number, number], radiusRange: [0.3, 20] as [number, number] };

    const first = firstValueFrom(service.getStats$());
    http.expectOne((req) => req.url.endsWith('/exoplanets/meta/stats')).flush(payload);
    await first;

    await expect(firstValueFrom(service.getStats$())).resolves.toEqual(payload);
    http.verify();
  });

  it('unwraps the system-planets endpoint into a plain list', async () => {
    const { service, http } = makeService();

    const result = firstValueFrom(service.getSystemPlanets$('Kepler-186'));
    const pending = http.expectOne(listUrl);
    expect(pending.request.params.get('q')).toBe('Kepler-186');
    expect(pending.request.params.get('pageSize')).toBe('50');

    pending.flush({ data: [{ id: 'kepler-186-f' }], total: 1, page: 1, pageSize: 50, totalPages: 1 });
    await expect(result).resolves.toEqual([{ id: 'kepler-186-f' }]);
  });
});

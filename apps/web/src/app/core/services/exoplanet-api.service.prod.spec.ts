import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ExoplanetFilters, SortState } from '@exodex/shared-types';

// Simulate a production build: the flag is a compile-time `false` there.
jest.mock('../config/mock-data.config', () => ({
  MOCK_DATA_ENABLED: false,
}));

import { MOCK_DATA_OPT_IN_KEY, ExoplanetApiService } from './exoplanet-api.service';
import { MOCK_DATA_ENABLED as PROD_MOCK_DATA_ENABLED } from '../config/mock-data.config.prod';

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

describe('production build: mock data gate', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => localStorage.clear());

  it('hard-codes the production flag to false', () => {
    expect(PROD_MOCK_DATA_ENABLED).toBe(false);
  });

  it('never returns mock rows for the planet list, even with the opt-in set', async () => {
    localStorage.setItem(MOCK_DATA_OPT_IN_KEY, 'true');
    const { service, http } = makeService();

    const result = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));

    http.expectOne((req) => req.url.endsWith('/exoplanets')).flush('boom', {
      status: 503,
      statusText: 'Service Unavailable',
    });

    // The only thing a production build can do here is surface the failure.
    await expect(result).rejects.toBeDefined();
    expect(service.isUsingMock()).toBe(false);
    expect(service.dataState()).toBe('degraded');
    expect(service.isDegraded()).toBe(true);
  });

  it('never returns mock rows for a single planet, even with the opt-in set', async () => {
    localStorage.setItem(MOCK_DATA_OPT_IN_KEY, 'true');
    const { service, http } = makeService();

    const result = firstValueFrom(service.getExoplanetById$('kepler-186-f'));

    http.expectOne((req) => req.url.endsWith('/exoplanets/kepler-186-f')).flush('boom', {
      status: 503,
      statusText: 'Service Unavailable',
    });

    await expect(result).rejects.toBeDefined();
    expect(service.isUsingMock()).toBe(false);
  });

  it('never returns mock rows for the statistics endpoint', async () => {
    localStorage.setItem(MOCK_DATA_OPT_IN_KEY, 'true');
    const { service, http } = makeService();

    const result = firstValueFrom(service.getStats$());

    http.expectOne((req) => req.url.endsWith('/exoplanets/meta/stats')).flush('boom', {
      status: 503,
      statusText: 'Service Unavailable',
    });

    await expect(result).rejects.toBeDefined();
    expect(service.isUsingMock()).toBe(false);
  });

  it('never fabricates a planet count for the status endpoint', async () => {
    localStorage.setItem(MOCK_DATA_OPT_IN_KEY, 'true');
    const { service, http } = makeService();

    const result = firstValueFrom(service.getStatus$());

    http.expectOne((req) => req.url.endsWith('/exoplanets/meta/status')).flush('boom', {
      status: 503,
      statusText: 'Service Unavailable',
    });

    await expect(result).rejects.toBeDefined();
  });

  it('serves real rows and reports the live data source when the API works', async () => {
    const { service, http } = makeService();

    const result = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));

    http.expectOne((req) => req.url.endsWith('/exoplanets')).flush({
      data: [{ id: 'kepler-186-f', name: 'Kepler-186 f' }],
      total: 1,
      page: 1,
      pageSize: 48,
      totalPages: 1,
    });

    await expect(result).resolves.toMatchObject({ total: 1 });
    expect(service.dataState()).toBe('live');
    expect(service.isDegraded()).toBe(false);
  });

  it('recovers to the live data source once the API answers again', async () => {
    const { service, http } = makeService();

    const failed = firstValueFrom(service.getExoplanets$(filters, sort, 1, 48));
    http.expectOne((req) => req.url.endsWith('/exoplanets')).flush('boom', { status: 503, statusText: 'x' });
    await expect(failed).rejects.toBeDefined();
    expect(service.dataState()).toBe('degraded');

    const recovered = firstValueFrom(service.getExoplanets$(filters, sort, 2, 48));
    http.expectOne((req) => req.url.endsWith('/exoplanets')).flush({
      data: [],
      total: 0,
      page: 2,
      pageSize: 48,
      totalPages: 0,
    });
    await expect(recovered).resolves.toMatchObject({ page: 2 });
    expect(service.dataState()).toBe('live');
  });
});

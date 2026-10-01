import { Injectable, inject, signal, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, shareReplay, tap, map, switchMap, from, throwError } from 'rxjs';
import { Exoplanet, ExoplanetFilters, SortState } from '@exodex/shared-types';
import { environment } from '../../../environments/environment';
import { MOCK_DATA_ENABLED } from '../config/mock-data.config';
import { ExoplanetMockService } from './exoplanet-mock.service';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface StatsResponse {
  totalCount: number;
  typeDistribution: Record<string, number>;
  methodDistribution: Record<string, number>;
  yearRange: [number, number];
  radiusRange: [number, number];
}

export type ApiDataState = 'live' | 'mock' | 'degraded';

interface StatusResponse {
  lastUpdated: string | null;
  totalPlanets: number;
  cacheAge: number;
  state?: 'loading' | 'ready' | 'error';
  lastError?: string | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 20;

/** localStorage key a developer must set to "true" to allow the mock dataset. */
export const MOCK_DATA_OPT_IN_KEY = 'exodex:allow-mock-data';

@Injectable({
  providedIn: 'root',
})
export class ExoplanetApiService {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private mockService: ExoplanetMockService | null = null;

  /**
   * Where the data currently rendered by the app comes from.
   * - `live`    : the NASA-backed API answered.
   * - `mock`    : development-only fabricated dataset (never in production).
   * - `degraded`: upstream is unavailable and nothing is being shown.
   */
  readonly dataState = signal<ApiDataState>('live');

  /**
   * Resolves the development-only mock service. Production builds replace the
   * mock service module with a stub that throws, and `MOCK_DATA_ENABLED` is a
   * compile-time `false` there, so this is unreachable in production.
   */
  private resolveMockService(): Promise<ExoplanetMockService> {
    if (!MOCK_DATA_ENABLED) {
      return Promise.reject(
        new Error('The mock dataset is not compiled into this build.')
      );
    }
    if (!this.mockService) {
      this.mockService = runInInjectionContext(
        this.injector,
        () => new ExoplanetMockService()
      );
    }
    return Promise.resolve(this.mockService);
  }

  /**
   * The mock dataset may only be served when this build allows it AND the
   * developer explicitly opted in. In production both are false, so upstream
   * failures surface as errors instead of invented planets.
   */
  private canServeMockData(): boolean {
    return MOCK_DATA_ENABLED && this.hasMockDataOptIn();
  }

  private hasMockDataOptIn(): boolean {
    try {
      return (
        typeof localStorage !== 'undefined' &&
        localStorage.getItem(MOCK_DATA_OPT_IN_KEY) === 'true'
      );
    } catch {
      return false;
    }
  }

  /**
   * Decides what to do when an upstream call fails: either the opt-in mock
   * dataset (development only) or the original error, which makes the caller
   * render an honest degraded state. It never fabricates data implicitly.
   */
  private onUpstreamError<T>(
    error: unknown,
    build: (mock: ExoplanetMockService) => Observable<T>
  ): Observable<T> {
    if (this.canServeMockData()) {
      this.dataState.set('mock');
      console.warn(
        `[exodex] API unavailable — serving the DEVELOPMENT-ONLY mock dataset. ` +
          `Set localStorage["${MOCK_DATA_OPT_IN_KEY}"] = "true" to disable this.`
      );
      return from(this.resolveMockService()).pipe(switchMap(build));
    }

    this.dataState.set('degraded');
    return throwError(() => error);
  }

  getExoplanets$(
    filters: ExoplanetFilters,
    sort: SortState,
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<Exoplanet>> {
    const cacheKey = this.buildCacheKey(filters, sort, page, pageSize);
    const cached = this.getFromCache<PaginatedResponse<Exoplanet>>(cacheKey);

    if (cached) {
      return of(cached);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sort', sort.field)
      .set('order', sort.direction);

    if (filters.searchQuery?.trim()) {
      params = params.set('q', filters.searchQuery.trim());
    }
    if (filters.planetTypes?.length) {
      params = params.set('types', filters.planetTypes.join(','));
    }
    if (filters.habitabilityClasses?.length) {
      params = params.set('habitability', filters.habitabilityClasses.join(','));
    }
    if (filters.discoveryMethods?.length) {
      params = params.set('methods', filters.discoveryMethods.join(','));
    }
    if (filters.discoveryYearRange) {
      params = params.set('minYear', filters.discoveryYearRange[0].toString());
      params = params.set('maxYear', filters.discoveryYearRange[1].toString());
    }
    if (filters.radiusEarthRange) {
      params = params.set('minRadius', filters.radiusEarthRange[0].toString());
      params = params.set('maxRadius', filters.radiusEarthRange[1].toString());
    }
    if (filters.stellarClasses?.length) {
      params = params.set('stellarClasses', filters.stellarClasses.join(','));
    }

    return this.http
      .get<PaginatedResponse<Exoplanet>>(`${environment.apiBaseUrl}/exoplanets`, { params })
      .pipe(
        tap((response) => {
          this.dataState.set('live');
          this.setCache(cacheKey, response);
        }),
        catchError((error) =>
          this.onUpstreamError(error, (mock) =>
            mock.getExoplanets$(filters, sort, page, pageSize)
          )
        ),
        shareReplay(1)
      );
  }

  getExoplanetById$(id: string): Observable<Exoplanet | null> {
    return this.http.get<Exoplanet>(`${environment.apiBaseUrl}/exoplanets/${id}`).pipe(
      tap(() => this.dataState.set('live')),
      catchError((error) =>
        this.onUpstreamError(error, (mock) => mock.getById$(id))
      ),
      shareReplay(1)
    );
  }

  getSystemPlanets$(hostStar: string): Observable<Exoplanet[]> {
    return this.http.get<PaginatedResponse<Exoplanet>>(`${environment.apiBaseUrl}/exoplanets`, { params: { q: hostStar, pageSize: '50' } })
      .pipe(
        map((res) => res.data),
        tap(() => this.dataState.set('live')),
        catchError((error) =>
          this.onUpstreamError(error, (mock) => mock.getSystemPlanets$(hostStar))
        ),
        shareReplay(1)
      );
  }

  getStats$(): Observable<StatsResponse> {
    const cacheKey = 'stats';
    const cached = this.getFromCache<StatsResponse>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<StatsResponse>(`${environment.apiBaseUrl}/exoplanets/meta/stats`)
      .pipe(
        tap((response) => {
          this.dataState.set('live');
          this.setCache(cacheKey, response);
        }),
        catchError((error) =>
          this.onUpstreamError(error, (mock) => mock.getStats$())
        ),
        shareReplay(1)
      );
  }

  getStatus$(): Observable<StatusResponse> {
    return this.http
      .get<StatusResponse>(`${environment.apiBaseUrl}/exoplanets/meta/status`)
      .pipe(
        catchError((error) =>
          this.onUpstreamError(error, () =>
            of<StatusResponse>({
              lastUpdated: null,
              totalPlanets: 0,
              cacheAge: -1,
              state: 'ready',
              lastError: 'Mock dataset in use (development only)',
            })
          )
        ),
        shareReplay(1)
      );
  }

  private buildCacheKey(
    filters: ExoplanetFilters,
    sort: SortState,
    page: number,
    pageSize: number
  ): string {
    return JSON.stringify({ filters, sort, page, pageSize });
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    if (this.cache.size >= MAX_CACHE_SIZE) {
      // Eliminar la entrada más antigua (primera del Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
    this.dataState.set('live');
  }

  isUsingMock(): boolean {
    return this.dataState() === 'mock';
  }

  /** True when upstream failed and the app is showing no data at all. */
  isDegraded(): boolean {
    return this.dataState() === 'degraded';
  }
}

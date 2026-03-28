import { Injectable, inject, signal, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, shareReplay, tap, map, switchMap, from } from 'rxjs';
import { Exoplanet, ExoplanetFilters, SortState } from '@exodex/shared-types';
import { environment } from '../../../environments/environment';

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

interface StatusResponse {
  lastUpdated: string | null;
  totalPlanets: number;
  cacheAge: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 20;

@Injectable({
  providedIn: 'root',
})
export class ExoplanetApiService {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private useMock = signal(false);
  private mockService: import('./exoplanet-mock.service').ExoplanetMockService | null = null;

  private async getMockService(): Promise<import('./exoplanet-mock.service').ExoplanetMockService> {
    if (!this.mockService) {
      const { ExoplanetMockService } = await import('./exoplanet-mock.service');
      this.mockService = runInInjectionContext(this.injector, () => new ExoplanetMockService());
    }
    return this.mockService;
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

    // Si ya sabemos que el backend no funciona, usar mock directamente
    if (this.useMock()) {
      return from(this.getMockService()).pipe(
        switchMap(service => service.getExoplanets$(filters, sort, page, pageSize))
      );
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
          this.setCache(cacheKey, response);
        }),
        catchError(() => {
          // Fallback a mock
          this.useMock.set(true);
          console.log('API no disponible, usando datos mock');
          return from(this.getMockService()).pipe(
            switchMap(service => service.getExoplanets$(filters, sort, page, pageSize))
          );
        }),
        shareReplay(1)
      );
  }

  getExoplanetById$(id: string): Observable<Exoplanet | null> {
    if (this.useMock()) {
      return from(this.getMockService()).pipe(
        switchMap(service => service.getById$(id))
      );
    }

    return this.http.get<Exoplanet>(`${environment.apiBaseUrl}/exoplanets/${id}`).pipe(
      catchError(() => {
        this.useMock.set(true);
        return from(this.getMockService()).pipe(
          switchMap(service => service.getById$(id))
        );
      }),
      shareReplay(1)
    );
  }

  getSystemPlanets$(hostStar: string): Observable<Exoplanet[]> {
    if (this.useMock()) {
      return from(this.getMockService()).pipe(
        switchMap(service => service.getSystemPlanets$(hostStar))
      );
    }
    return this.http.get<PaginatedResponse<Exoplanet>>(`${environment.apiBaseUrl}/exoplanets`, { params: { q: hostStar, pageSize: '50' } })
      .pipe(
        map((res) => res.data),
        catchError(() => {
          this.useMock.set(true);
          return from(this.getMockService()).pipe(
            switchMap(service => service.getSystemPlanets$(hostStar))
          );
        }),
        shareReplay(1)
      );
  }

  getStats$(): Observable<StatsResponse> {
    if (this.useMock()) {
      return from(this.getMockService()).pipe(
        switchMap(service => service.getStats$())
      );
    }

    const cacheKey = 'stats';
    const cached = this.getFromCache<StatsResponse>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<StatsResponse>(`${environment.apiBaseUrl}/exoplanets/meta/stats`)
      .pipe(
        tap((response) => {
          this.setCache(cacheKey, response);
        }),
        catchError(() => {
          this.useMock.set(true);
          return from(this.getMockService()).pipe(
            switchMap(service => service.getStats$())
          );
        }),
        shareReplay(1)
      );
  }

  getStatus$(): Observable<StatusResponse> {
    if (this.useMock()) {
      return of({
        lastUpdated: new Date().toISOString(),
        totalPlanets: 20,
        cacheAge: 0,
      });
    }

    return this.http
      .get<StatusResponse>(`${environment.apiBaseUrl}/exoplanets/meta/status`)
      .pipe(
        catchError(() => {
          this.useMock.set(true);
          return of({
            lastUpdated: new Date().toISOString(),
            totalPlanets: 20,
            cacheAge: 0,
          });
        }),
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
    this.useMock.set(false);
  }

  isUsingMock(): boolean {
    return this.useMock();
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, shareReplay, tap } from 'rxjs';
import { Exoplanet, ExoplanetFilters, SortState } from '@exodex/shared-types';
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

interface StatusResponse {
  lastUpdated: string | null;
  totalPlanets: number;
  cacheAge: number;
}

const API_BASE_URL = 'http://localhost:3000/api';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

@Injectable({
  providedIn: 'root',
})
export class ExoplanetApiService {
  private http = inject(HttpClient);
  private mockService = inject(ExoplanetMockService);
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private useMock = signal(false);

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
      return this.mockService.getExoplanets$(filters, sort, page, pageSize);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sortField', sort.field)
      .set('sortDirection', sort.direction);

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

    return this.http
      .get<PaginatedResponse<Exoplanet>>(`${API_BASE_URL}/exoplanets`, { params })
      .pipe(
        tap((response) => {
          this.setCache(cacheKey, response);
        }),
        shareReplay(1),
        catchError(() => {
          // Fallback a mock
          this.useMock.set(true);
          console.log('API no disponible, usando datos mock');
          return this.mockService.getExoplanets$(filters, sort, page, pageSize);
        })
      );
  }

  getExoplanetById$(id: string): Observable<Exoplanet | null> {
    if (this.useMock()) {
      return this.mockService.getById$(id);
    }

    return this.http.get<Exoplanet>(`${API_BASE_URL}/exoplanets/${id}`).pipe(
      shareReplay(1),
      catchError(() => {
        this.useMock.set(true);
        return this.mockService.getById$(id);
      })
    );
  }

  getStats$(): Observable<StatsResponse> {
    if (this.useMock()) {
      return this.mockService.getStats$();
    }

    const cacheKey = 'stats';
    const cached = this.getFromCache<StatsResponse>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<StatsResponse>(`${API_BASE_URL}/exoplanets/stats`)
      .pipe(
        tap((response) => {
          this.setCache(cacheKey, response);
        }),
        shareReplay(1),
        catchError(() => {
          this.useMock.set(true);
          return this.mockService.getStats$();
        })
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
      .get<StatusResponse>(`${API_BASE_URL}/exoplanets/status`)
      .pipe(
        shareReplay(1),
        catchError(() => {
          this.useMock.set(true);
          return of({
            lastUpdated: new Date().toISOString(),
            totalPlanets: 20,
            cacheAge: 0,
          });
        })
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

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Exoplanet, ExoplanetFilters, SortState } from '@exodex/shared-types';

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
  private cache = new Map<string, { data: unknown; timestamp: number }>();

  getExoplanets$(
    filters: ExoplanetFilters,
    sort: SortState,
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<Exoplanet>> {
    const cacheKey = this.buildCacheKey(filters, sort, page, pageSize);
    const cached = this.getFromCache<PaginatedResponse<Exoplanet>>(cacheKey);

    if (cached) {
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sort', sort.field)
      .set('order', sort.direction);

    if (filters.planetTypes.length > 0) {
      params = params.set('types', filters.planetTypes.join(','));
    }
    if (filters.discoveryMethods.length > 0) {
      params = params.set('methods', filters.discoveryMethods.join(','));
    }
    if (filters.habitabilityClasses.length > 0) {
      params = params.set('habitability', filters.habitabilityClasses.join(','));
    }
    if (filters.discoveryYearRange) {
      params = params.set('minYear', filters.discoveryYearRange[0].toString());
      params = params.set('maxYear', filters.discoveryYearRange[1].toString());
    }
    if (filters.radiusEarthRange) {
      params = params.set('minRadius', filters.radiusEarthRange[0].toString());
      params = params.set('maxRadius', filters.radiusEarthRange[1].toString());
    }
    if (filters.searchQuery.trim()) {
      params = params.set('q', filters.searchQuery.trim());
    }

    return this.http
      .get<PaginatedResponse<Exoplanet>>(`${API_BASE_URL}/exoplanets`, { params })
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getExoplanetById$(id: string): Observable<Exoplanet> {
    return this.http.get<Exoplanet>(`${API_BASE_URL}/exoplanets/${id}`).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getStats$(): Observable<StatsResponse> {
    const cacheKey = 'stats';
    const cached = this.getFromCache<StatsResponse>(cacheKey);

    if (cached) {
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.http
      .get<StatsResponse>(`${API_BASE_URL}/exoplanets/meta/stats`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getStatus$(): Observable<StatusResponse> {
    return this.http
      .get<StatusResponse>(`${API_BASE_URL}/exoplanets/meta/status`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
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
  }
}

import { Observable, throwError } from 'rxjs';
import { Exoplanet, ExoplanetFilters, SortState } from '@exodex/shared-types';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Production build of the development mock service.
 *
 * The production build replaces `exoplanet-mock.service.ts` with this file (see
 * the `fileReplacements` entry in `apps/web/project.json`), so the ~20 kB
 * fabricated dataset is never compiled into a production bundle. Every method
 * fails loudly: a production build must never answer with invented planets.
 */
export class ExoplanetMockService {
  private unavailable<T>(): Observable<T> {
    return throwError(
      () => new Error('The mock dataset is not compiled into this build.')
    );
  }

  getExoplanets$(
    _filters: ExoplanetFilters,
    _sort: SortState,
    _page: number,
    _pageSize: number
  ): Observable<PaginatedResponse<Exoplanet>> {
    return this.unavailable();
  }

  getStats$(): Observable<{
    totalCount: number;
    typeDistribution: Record<string, number>;
    methodDistribution: Record<string, number>;
    yearRange: [number, number];
    radiusRange: [number, number];
  }> {
    return this.unavailable();
  }

  getById$(_id: string): Observable<Exoplanet | null> {
    return this.unavailable();
  }

  getSystemPlanets$(_hostStar: string): Observable<Exoplanet[]> {
    return this.unavailable();
  }
}

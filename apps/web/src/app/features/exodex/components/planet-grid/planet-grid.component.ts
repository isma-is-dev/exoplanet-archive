import { Component, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, startWith, tap, observeOn, asyncScheduler, map, catchError, of } from 'rxjs';
import { Exoplanet } from '@exodex/shared-types';
import { FilterStateService } from '../../../../core/services/filter-state.service';
import { ExoplanetApiService } from '../../../../core/services/exoplanet-api.service';
import { combineLatest } from 'rxjs';
import {
  PlanetCardComponent,
  SkeletonCardComponent,
  PaginationComponent,
  EmptyStateComponent,
} from '@exodex/ui-components';

interface ExoplanetResponse {
  data: Exoplanet[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Sentinel for "the upstream API failed" — never rendered as data. */
const UPSTREAM_UNAVAILABLE = Symbol('exodex-upstream-unavailable');
type GridResult = ExoplanetResponse | typeof UPSTREAM_UNAVAILABLE;

@Component({
  selector: 'app-planet-grid',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PlanetCardComponent,
    SkeletonCardComponent,
    PaginationComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="planet-grid-container">
      @if (isLoading()) {
        <!-- Loading state -->
        <div class="skeleton-grid">
          @for (i of skeletonArray(); track $index) {
            <app-skeleton-card [viewMode]="viewMode()" />
          }
        </div>
      } @else if (upstreamUnavailable()) {
        <!-- Honest degraded state: the NASA-backed API could not be reached -->
        <div class="data-unavailable" role="alert">
          <h3 class="data-unavailable-title">{{ 'dataUnavailable.title' | translate }}</h3>
          <p class="data-unavailable-message">{{ 'dataUnavailable.message' | translate }}</p>
          <p class="data-unavailable-note">{{ 'dataUnavailable.note' | translate }}</p>
          <button class="data-unavailable-retry" (click)="retry()">
            {{ 'dataUnavailable.retry' | translate }}
          </button>
        </div>
      } @else if (exoplanets().length === 0) {
        <!-- Empty state -->
        <app-empty-state (clearFilters)="clearFilters()" />
      } @else {
        <!-- Grid -->
        <div
          class="planet-grid"
          [class.planet-grid--list]="viewMode() === 'list'"
        >
          @for (planet of exoplanets(); track planet.id) {
            <app-planet-card
              [planet]="planet"
              (click)="navigateToDetail(planet)"
              [style.animation-delay]="getAnimationDelay($index)"
              class="grid-item"
            />
          }
        </div>
      }

      @if (!isLoading() && totalPages() > 1) {
        <!-- Pagination -->
        <app-pagination
          [currentPage]="page()"
          [totalPages]="totalPages()"
          (pageChange)="goToPage($event)"
        />
      }
    </div>
  `,
  styles: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(24px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .planet-grid-container {
      padding: 16px 0;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 20px;
    }

    .planet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 20px;
    }

    .planet-grid--list {
      grid-template-columns: 1fr;
    }

    .grid-item {
      display: block;
      animation: fadeInUp 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    app-planet-card {
      display: block;
    }

    .data-unavailable {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 64px 24px;
      text-align: center;
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 16px;
      background: rgba(245, 158, 11, 0.06);
    }

    .data-unavailable-title {
      margin: 0;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #f5a524;
    }

    .data-unavailable-message,
    .data-unavailable-note {
      margin: 0;
      max-width: 520px;
      font-size: 14px;
      line-height: 1.6;
      color: #8892b0;
    }

    .data-unavailable-note {
      font-size: 13px;
      color: #5f6884;
    }

    .data-unavailable-retry {
      margin-top: 8px;
      padding: 10px 22px;
      background: rgba(77, 138, 255, 0.1);
      border: 1px solid rgba(77, 138, 255, 0.3);
      border-radius: 12px;
      color: #4d8aff;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: 'Orbitron', sans-serif;
      cursor: pointer;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .data-unavailable-retry:hover {
      background: rgba(77, 138, 255, 0.2);
      box-shadow: 0 0 25px rgba(77, 138, 255, 0.2);
    }

    @media (max-width: 480px) {
      .planet-grid, .skeleton-grid {
        grid-template-columns: 1fr;
        gap: 14px;
      }
    }
  `,
})
export class PlanetGridComponent {
  private filterState = inject(FilterStateService);
  private apiService = inject(ExoplanetApiService);
  private router = inject(Router);

  filters = this.filterState.filters;
  sort = this.filterState.sort;
  page = this.filterState.page;
  pageSize = this.filterState.pageSize;
  viewMode = this.filterState.viewMode;

  isLoading = signal(true);
  upstreamUnavailable = signal(false);
  exoplanets = signal<Exoplanet[]>([]);
  totalPages = signal(0);
  skeletonArray = signal(Array(12).fill(0));

  private filters$ = toObservable(this.filters);
  private sort$ = toObservable(this.sort);
  private page$ = toObservable(this.page);
  private pageSize$ = toObservable(this.pageSize);

  private reload$ = signal(0);

  private response = toSignal<GridResult | null>(
    combineLatest([
      this.filters$,
      this.sort$,
      this.page$,
      this.pageSize$,
      toObservable(this.reload$),
    ]).pipe(
      tap(() => {
        this.isLoading.set(true);
        this.upstreamUnavailable.set(false);
      }),
      switchMap(([filters, sort, page, pageSize]) =>
        this.apiService.getExoplanets$(filters, sort, page, pageSize).pipe(
          observeOn(asyncScheduler),
          map((res): GridResult => res),
          catchError(() => of(UPSTREAM_UNAVAILABLE))
        )
      ),
      startWith(null)
    )
  );

  constructor() {
    effect(() => {
      const resp = this.response();
      if (resp === null) {
        this.isLoading.set(true);
      } else if (resp === UPSTREAM_UNAVAILABLE) {
        this.isLoading.set(false);
        this.upstreamUnavailable.set(true);
        this.exoplanets.set([]);
        this.totalPages.set(0);
      } else {
        const data = resp as ExoplanetResponse;
        this.exoplanets.set(data.data);
        this.totalPages.set(data.totalPages);
        this.isLoading.set(false);
      }
    });
  }

  trackById(index: number, item: { id: string }): string {
    return item.id;
  }

  navigateToDetail(planet: { id: string }): void {
    this.router.navigate(['/planeta', planet.id]);
  }

  goToPage(pageNum: number): void {
    this.filterState.setPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected getAnimationDelay(index: number): string {
    return `${Math.min(index, 7) * 60}ms`;
  }

  clearFilters(): void {
    this.filterState.resetFilters();
  }

  /** Re-runs the query after an upstream failure. */
  retry(): void {
    this.apiService.clearCache();
    this.reload$.update((n) => n + 1);
  }
}

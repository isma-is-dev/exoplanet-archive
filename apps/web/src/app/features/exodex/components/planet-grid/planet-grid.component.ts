import { Component, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, startWith } from 'rxjs';
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

@Component({
  selector: 'app-planet-grid',
  standalone: true,
  imports: [
    CommonModule,
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
    .planet-grid-container {
      padding: 16px 0;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .planet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .planet-grid--list {
      grid-template-columns: 1fr;
    }

    app-planet-card {
      display: block;
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
  exoplanets = signal<Exoplanet[]>([]);
  totalPages = signal(0);
  skeletonArray = signal(Array(12).fill(0));

  private filters$ = toObservable(this.filters);
  private sort$ = toObservable(this.sort);
  private page$ = toObservable(this.page);
  private pageSize$ = toObservable(this.pageSize);

  private response = toSignal(
    combineLatest([this.filters$, this.sort$, this.page$, this.pageSize$]).pipe(
      switchMap(([filters, sort, page, pageSize]) =>
        this.apiService.getExoplanets$(filters, sort, page, pageSize)
      ),
      startWith(null)
    )
  );

  constructor() {
    effect(() => {
      const resp = this.response();
      if (resp === null) {
        this.isLoading.set(true);
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
  }

  clearFilters(): void {
    this.filterState.resetFilters();
  }
}

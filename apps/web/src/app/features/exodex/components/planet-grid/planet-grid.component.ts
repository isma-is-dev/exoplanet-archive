import { Component, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, startWith } from 'rxjs';
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
  data: unknown[];
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
      <!-- Loading state -->
      <div class="skeleton-grid" *ngIf="isLoading()">
        <app-skeleton-card
          *ngFor="let i of skeletonArray()"
          [viewMode]="viewMode()"
        />
      </div>

      <!-- Empty state -->
      <app-empty-state
        *ngIf="!isLoading() && exoplanets().length === 0"
        (clearFilters)="clearFilters()"
      />

      <!-- Grid -->
      <div
        class="planet-grid"
        [class.planet-grid--list]="viewMode() === 'list'"
        *ngIf="!isLoading() && exoplanets().length > 0"
      >
        <app-planet-card
          *ngFor="let planet of exoplanets(); trackBy: trackById"
          [planet]="planet"
          (click)="navigateToDetail(planet)"
        />
      </div>

      <!-- Pagination -->
      <app-pagination
        *ngIf="!isLoading() && totalPages() > 1"
        [currentPage]="page()"
        [totalPages]="totalPages()"
        (pageChange)="goToPage($event)"
      />
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
  exoplanets = signal<unknown[]>([]);
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

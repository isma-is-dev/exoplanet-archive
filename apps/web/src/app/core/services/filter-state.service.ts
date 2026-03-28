import { Injectable, effect, untracked } from '@angular/core';
import { signal, computed } from '@angular/core';
import { ExoplanetFilters, SortState, SortField, SortDirection } from '@exodex/shared-types';

const DEFAULT_FILTERS: ExoplanetFilters = {
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

const DEFAULT_SORT: SortState = {
  field: 'index' as SortField,
  direction: 'asc' as SortDirection,
};

@Injectable({
  providedIn: 'root',
})
export class FilterStateService {
  // Estado primario
  readonly filters = signal<ExoplanetFilters>({ ...DEFAULT_FILTERS });
  readonly sort = signal<SortState>({ ...DEFAULT_SORT });
  readonly page = signal<number>(1);
  readonly pageSize = signal<48 | 96>(48);
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly sidebarOpen = signal<boolean>(false);

  // Computed
  readonly activeFilterCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.planetTypes.length > 0) count++;
    if (f.discoveryMethods.length > 0) count++;
    if (f.habitabilityClasses.length > 0) count++;
    if (f.stellarClasses.length > 0) count++;
    if (f.discoveryYearRange !== null) count++;
    if (f.radiusEarthRange !== null) count++;
    if (f.massEarthRange !== null) count++;
    if (f.equilibriumTempKRange !== null) count++;
    if (f.searchQuery.trim().length > 0) count++;
    return count;
  });

  readonly hasActiveFilters = computed(() => this.activeFilterCount() > 0);

  // Cuando cambian filtros, resetear página
  constructor() {
    effect(() => {
      this.filters();
      this.sort();
      untracked(() => this.page.set(1));
    });
  }

  updateFilter<K extends keyof ExoplanetFilters>(key: K, value: ExoplanetFilters[K]): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  resetFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
  }

  setSort(field: SortField, direction: SortDirection): void {
    this.sort.set({ field, direction });
  }

  toggleSort(field: SortField): void {
    const current = this.sort();
    if (current.field === field) {
      this.sort.set({
        field,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      this.sort.set({ field, direction: 'asc' });
    }
  }

  setPage(page: number): void {
    this.page.set(Math.max(1, page));
  }

  nextPage(): void {
    this.page.update((p) => p + 1);
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }

  toggleViewMode(): void {
    this.viewMode.update((m) => (m === 'grid' ? 'list' : 'grid'));
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((s) => !s);
  }
}

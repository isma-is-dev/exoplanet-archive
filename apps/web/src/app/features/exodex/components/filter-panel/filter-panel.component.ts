import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs';
import { FilterStateService } from '../../../../core/services/filter-state.service';
import { ExoplanetApiService } from '../../../../core/services/exoplanet-api.service';
import { SearchInputComponent, FilterChipComponent } from '@exodex/ui-components';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchInputComponent, FilterChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-panel">
      <div class="filter-section">
        <app-search-input
          [placeholder]="'common.searchPlanet' | translate"
          (search)="onSearch($event)"
        />
      </div>

      <div class="filter-section">
        <h3>{{ 'filters.planetType' | translate }}</h3>
        <div class="filter-chips">
          @for (type of planetTypes(); track type.value) {
            <app-filter-chip
              [label]="type.label"
              [selected]="isTypeSelected(type.value)"
              (selectedChange)="toggleType(type.value)"
            />
          }
        </div>
      </div>

      <div class="filter-section">
        <h3>{{ 'filters.habitability' | translate }}</h3>
        <div class="filter-chips">
          @for (h of habitabilityOptions(); track h.value) {
            <app-filter-chip
              [label]="h.label"
              [selected]="isHabitabilitySelected(h.value)"
              (selectedChange)="toggleHabitability(h.value)"
            />
          }
        </div>
      </div>

      @if (stats(); as s) {
        <div class="filter-section">
          <h3>{{ 'filters.discoveryYear' | translate }}</h3>
          <div class="range-inputs">
            <input
              type="number"
              [min]="s.yearRange[0]"
              [max]="s.yearRange[1]"
              [value]="filters().discoveryYearRange?.[0] ?? s.yearRange[0]"
              (change)="updateYearRange($event, 0)"
            />
            <span>-</span>
            <input
              type="number"
              [min]="s.yearRange[0]"
              [max]="s.yearRange[1]"
              [value]="filters().discoveryYearRange?.[1] ?? s.yearRange[1]"
              (change)="updateYearRange($event, 1)"
            />
          </div>
        </div>
      }

      @if (filterState.hasActiveFilters()) {
        <button
          class="clear-btn"
          (click)="filterState.resetFilters()"
        >
          {{ 'common.clearFilters' | translate }}
        </button>
      }
    </div>
  `,
  styles: `
    .filter-panel {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .filter-section h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #8892b0;
      margin-bottom: 12px;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .range-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .range-inputs input {
      width: 80px;
      padding: 8px;
      font-size: 13px;
    }

    .range-inputs span {
      color: #8892b0;
    }

    .clear-btn {
      padding: 10px 16px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 8px;
      color: #ef4444;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
      margin-top: 8px;
    }

    .clear-btn:hover {
      background: rgba(239, 68, 68, 0.25);
    }
  `,
})
export class FilterPanelComponent {
  protected filterState = inject(FilterStateService);
  private apiService = inject(ExoplanetApiService);
  private translate = inject(TranslateService);

  filters = this.filterState.filters;
  stats = toSignal(this.apiService.getStats$().pipe(startWith(null)));

  planetTypes = toSignal(
    this.translate.onLangChange.pipe(
      startWith(null),
      map(() => [
        { value: 'rocky-terrestrial', label: this.translate.instant('filters.planetTypes.rocky-terrestrial') },
        { value: 'super-earth', label: this.translate.instant('filters.planetTypes.super-earth') },
        { value: 'mini-neptune', label: this.translate.instant('filters.planetTypes.mini-neptune') },
        { value: 'neptunian', label: this.translate.instant('filters.planetTypes.neptunian') },
        { value: 'jovian', label: this.translate.instant('filters.planetTypes.jovian') },
        { value: 'hot-jupiter', label: this.translate.instant('filters.planetTypes.hot-jupiter') },
        { value: 'cold-giant', label: this.translate.instant('filters.planetTypes.cold-giant') },
      ])
    ),
    { requireSync: true }
  );

  habitabilityOptions = toSignal(
    this.translate.onLangChange.pipe(
      startWith(null),
      map(() => [
        { value: 'potentially-habitable', label: this.translate.instant('filters.habitabilityOptions.potentially-habitable') },
        { value: 'marginal', label: this.translate.instant('filters.habitabilityOptions.marginal') },
        { value: 'uninhabitable', label: this.translate.instant('filters.habitabilityOptions.uninhabitable') },
        { value: 'unknown', label: this.translate.instant('filters.habitabilityOptions.unknown') },
      ])
    ),
    { requireSync: true }
  );

  onSearch(query: string): void {
    this.filterState.updateFilter('searchQuery', query);
  }

  isTypeSelected(type: string): boolean {
    return this.filters().planetTypes.includes(type as never);
  }

  toggleType(type: string): void {
    const current = this.filters().planetTypes;
    const updated = current.includes(type as never)
      ? current.filter((t) => t !== type)
      : [...current, type as never];
    this.filterState.updateFilter('planetTypes', updated);
  }

  isHabitabilitySelected(h: string): boolean {
    return this.filters().habitabilityClasses.includes(h as never);
  }

  toggleHabitability(h: string): void {
    const current = this.filters().habitabilityClasses;
    const updated = current.includes(h as never)
      ? current.filter((x) => x !== h)
      : [...current, h as never];
    this.filterState.updateFilter('habitabilityClasses', updated);
  }

  updateYearRange(event: Event, index: number): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    const current = this.filters().discoveryYearRange;
    const updated: [number, number] = current
      ? [...current] as [number, number]
      : [1992, new Date().getFullYear()];
    updated[index] = value;
    this.filterState.updateFilter('discoveryYearRange', updated);
  }
}

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
        <h3><span class="section-indicator"></span>{{ 'filters.planetType' | translate }}</h3>
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
        <h3><span class="section-indicator"></span>{{ 'filters.habitability' | translate }}</h3>
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
          <h3><span class="section-indicator"></span>{{ 'filters.discoveryYear' | translate }}</h3>
          <div class="range-inputs">
            <input
              type="number"
              [min]="s.yearRange[0]"
              [max]="s.yearRange[1]"
              [value]="filters().discoveryYearRange?.[0] ?? s.yearRange[0]"
              (change)="updateYearRange($event, 0)"
            />
            <span class="range-separator">→</span>
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
          ✕ {{ 'common.clearFilters' | translate }}
        </button>
      }
    </div>
  `,
  styles: `
    .filter-panel {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .filter-section h3 {
      font-family: 'Orbitron', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(77, 138, 255, 0.6);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-indicator {
      display: inline-block;
      width: 3px;
      height: 12px;
      background: linear-gradient(180deg, #4d8aff, #a855f7);
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(77, 138, 255, 0.4);
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .range-inputs {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .range-inputs input {
      width: 80px;
      padding: 8px 10px;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(15, 20, 40, 0.6);
      border: 1px solid rgba(77, 138, 255, 0.1);
      border-radius: 10px;
      color: #e8eeff;
      text-align: center;
    }

    .range-separator {
      color: rgba(77, 138, 255, 0.4);
      font-size: 14px;
    }

    .clear-btn {
      padding: 10px 16px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      color: #ef4444;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 300ms ease;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.5px;
    }

    .clear-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
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

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStateService } from '../../../../core/services/filter-state.service';
import { SortField } from '@exodex/shared-types';

@Component({
  selector: 'app-sort-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sort-bar">
      <span class="sort-label">Ordenar por:</span>
      <div class="sort-options">
        <button
          *ngFor="let option of sortOptions"
          class="sort-btn"
          [class.active]="sort().field === option.value"
          [class.asc]="sort().field === option.value && sort().direction === 'asc'"
          [class.desc]="sort().field === option.value && sort().direction === 'desc'"
          (click)="toggleSort(option.value)"
        >
          {{ option.label }}
          <span class="sort-arrow" *ngIf="sort().field === option.value">
            {{ sort().direction === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
    </div>
  `,
  styles: `
    .sort-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .sort-label {
      font-size: 13px;
      color: #8892b0;
      white-space: nowrap;
    }

    .sort-options {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .sort-btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      background: transparent;
      border: 1px solid transparent;
      color: #8892b0;
      cursor: pointer;
      transition: all 150ms ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sort-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f0f4ff;
    }

    .sort-btn.active {
      background: rgba(94, 142, 255, 0.1);
      border-color: rgba(94, 142, 255, 0.3);
      color: #5e8eff;
    }

    .sort-arrow {
      font-size: 10px;
    }
  `,
})
export class SortBarComponent {
  private filterState = inject(FilterStateService);

  sort = this.filterState.sort;

  sortOptions: { value: SortField; label: string }[] = [
    { value: 'index', label: 'Índice' },
    { value: 'name', label: 'Nombre' },
    { value: 'discoveryYear', label: 'Año' },
    { value: 'radiusEarth', label: 'Radio' },
    { value: 'massEarth', label: 'Masa' },
    { value: 'equilibriumTempK', label: 'Temperatura' },
    { value: 'habitabilityScore', label: 'Habitabilidad' },
  ];

  toggleSort(field: SortField): void {
    this.filterState.toggleSort(field);
  }
}

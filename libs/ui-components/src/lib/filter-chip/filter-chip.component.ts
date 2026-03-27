import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="filter-chip"
      [class.selected]="selected()"
      [class.has-count]="count() !== null"
      (click)="toggle()"
    >
      <span class="chip-label">{{ label() }}</span>
      <span class="chip-count" *ngIf="count() !== null">({{ count() }})</span>
    </button>
  `,
  styles: `
    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #8892b0;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .filter-chip:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.16);
      color: #f0f4ff;
    }

    .filter-chip.selected {
      background: rgba(94, 142, 255, 0.15);
      border-color: rgba(94, 142, 255, 0.4);
      color: #5e8eff;
    }

    .filter-chip.selected:hover {
      background: rgba(94, 142, 255, 0.2);
    }

    .chip-count {
      font-size: 11px;
      opacity: 0.7;
    }
  `,
})
export class FilterChipComponent {
  label = input.required<string>();
  selected = input<boolean>(false);
  count = input<number | null>(null);

  selectedChange = output<boolean>();

  toggle(): void {
    this.selectedChange.emit(!this.selected());
  }
}

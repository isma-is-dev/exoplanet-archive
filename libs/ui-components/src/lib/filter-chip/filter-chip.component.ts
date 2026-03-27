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
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #8892b0;
      cursor: pointer;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .filter-chip:hover {
      background: rgba(77, 138, 255, 0.08);
      border-color: rgba(77, 138, 255, 0.2);
      color: #e8eeff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .filter-chip.selected {
      background: rgba(77, 138, 255, 0.12);
      border-color: rgba(77, 138, 255, 0.35);
      color: #4d8aff;
      box-shadow:
        0 0 12px rgba(77, 138, 255, 0.15),
        inset 0 0 12px rgba(77, 138, 255, 0.05);
      text-shadow: 0 0 6px rgba(77, 138, 255, 0.3);
    }

    .filter-chip.selected:hover {
      background: rgba(77, 138, 255, 0.18);
    }

    .chip-count {
      font-size: 10px;
      opacity: 0.6;
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

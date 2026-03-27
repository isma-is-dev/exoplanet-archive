import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-row">
      <span class="stat-label">{{ label() }}</span>
      <span class="stat-value">
        {{ formattedValue() }}
        <span class="stat-unit" *ngIf="unit()">{{ unit() }}</span>
      </span>
    </div>
  `,
  styles: `
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .stat-row:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-size: 12px;
      color: #8892b0;
    }

    .stat-value {
      font-size: 13px;
      font-weight: 500;
      color: #f0f4ff;
      font-family: 'JetBrains Mono', monospace;
    }

    .stat-unit {
      color: #4a5568;
      font-size: 11px;
      margin-left: 2px;
    }
  `,
})
export class StatRowComponent {
  label = input.required<string>();
  value = input<number | string | null>();
  unit = input<string>('');

  formattedValue(): string {
    const val = this.value();
    if (val === null || val === undefined) return '—';

    // Si es string, devolver directamente
    if (typeof val === 'string') return val;

    // Formatear números grandes
    if (val >= 1000) {
      return val.toLocaleString('es-ES', { maximumFractionDigits: 1 });
    }

    // Formatear decimales
    if (val < 0.01) {
      return val.toExponential(2);
    }

    return val.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  }
}

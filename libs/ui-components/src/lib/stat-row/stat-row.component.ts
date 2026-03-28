import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-row">
      <span class="stat-label">{{ label() }}</span>
      <span class="stat-dots"></span>
      <span class="stat-value">
        <ng-container *ngIf="!href()">
          {{ formattedValue() }}
        </ng-container>
        <a *ngIf="href()" [href]="href()" [target]="isExternalLink() ? '_blank' : '_self'" class="stat-link">
          {{ formattedValue() }}
          <svg *ngIf="isExternalLink()" class="external-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
        <span class="stat-unit" *ngIf="unit()">{{ unit() }}</span>
        <span class="stat-uncertainty" *ngIf="hasUncertainty()">
          <span class="unc-plus">+{{ formattedErr(errPlus()) }}</span>
          <span class="unc-sep">/</span>
          <span class="unc-minus">{{ formattedErr(errMinus()) }}</span>
        </span>
      </span>
    </div>
  `,
  styles: `
    .stat-row {
      display: flex;
      align-items: center;
      padding: 7px 0;
      border-bottom: 1px solid rgba(77, 138, 255, 0.04);
      gap: 8px;
    }

    .stat-row:last-child {
      border-bottom: none;
    }

    .stat-row:hover {
      background: rgba(77, 138, 255, 0.02);
      border-radius: 6px;
      padding-left: 4px;
      padding-right: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #8892b0;
      white-space: nowrap;
    }

    .stat-dots {
      flex: 1;
      border-bottom: 1px dotted rgba(255, 255, 255, 0.06);
      min-width: 20px;
      height: 1px;
      margin: 0 4px;
      align-self: flex-end;
      margin-bottom: 5px;
    }

    .stat-value {
      font-size: 13px;
      font-weight: 500;
      color: #e8eeff;
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
      text-shadow: 0 0 6px rgba(232, 238, 255, 0.1);
    }

    .stat-unit {
      color: rgba(77, 138, 255, 0.5);
      font-size: 11px;
      margin-left: 3px;
    }

    .stat-link {
      color: #6da5ff;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 200ms ease;
    }

    .stat-link:hover {
      color: #9ac2ff;
      text-shadow: 0 0 8px rgba(154, 194, 255, 0.4);
    }

    .external-icon {
      opacity: 0.7;
      margin-bottom: 1px;
    }

    .stat-uncertainty {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(136, 146, 176, 0.7);
      margin-left: 4px;
    }

    .unc-plus { color: rgba(34, 197, 94, 0.7); }
    .unc-sep  { color: rgba(136, 146, 176, 0.4); }
    .unc-minus { color: rgba(239, 68, 68, 0.65); }
  `,
})
export class StatRowComponent {
  label = input.required<string>();
  value = input<number | string | null>();
  unit = input<string>('');
  href = input<string | null>(null);
  isExternalLink = input<boolean>(false);
  errPlus = input<number | null>(null);
  errMinus = input<number | null>(null);

  hasUncertainty(): boolean {
    const v = this.value();
    return v !== null && v !== undefined && typeof v === 'number' &&
           (this.errPlus() !== null || this.errMinus() !== null);
  }

  formattedErr(val: number | null | undefined): string {
    if (val === null || val === undefined) return '—';
    const abs = Math.abs(val);
    if (abs < 0.001) return abs.toExponential(1);
    return abs.toLocaleString('es-ES', { maximumFractionDigits: 3 });
  }

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

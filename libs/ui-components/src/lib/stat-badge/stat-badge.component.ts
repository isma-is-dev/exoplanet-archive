import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeType = 'type' | 'habitability' | 'method';

@Component({
  selector: 'app-stat-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="'badge--' + type()" [attr.data-value]="value()">
      {{ displayText() }}
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge--type {
      background: rgba(94, 142, 255, 0.15);
      color: #5e8eff;
    }

    .badge--habitability[data-value="potentially-habitable"] {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .badge--habitability[data-value="marginal"] {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    .badge--habitability[data-value="uninhabitable"] {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .badge--habitability[data-value="unknown"] {
      background: rgba(136, 146, 176, 0.15);
      color: #8892b0;
    }

    .badge--method {
      background: rgba(168, 85, 247, 0.15);
      color: #a855f7;
    }
  `,
})
export class StatBadgeComponent {
  type = input.required<BadgeType>();
  value = input.required<string>();

  displayText(): string {
    const val = this.value();
    if (!val) return '';

    // Convertir kebab-case a texto legible
    return val
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

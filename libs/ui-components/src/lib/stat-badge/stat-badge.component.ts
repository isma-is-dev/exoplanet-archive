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
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: 'Orbitron', sans-serif;
      border: 1px solid transparent;
      transition: all 300ms ease;
    }

    .badge--type {
      background: rgba(77, 138, 255, 0.1);
      color: #4d8aff;
      border-color: rgba(77, 138, 255, 0.2);
      text-shadow: 0 0 8px rgba(77, 138, 255, 0.3);
    }

    .badge--habitability[data-value="potentially-habitable"] {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.25);
      text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
    }

    .badge--habitability[data-value="marginal"] {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border-color: rgba(245, 158, 11, 0.25);
      text-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
    }

    .badge--habitability[data-value="uninhabitable"] {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
      text-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
    }

    .badge--habitability[data-value="unknown"] {
      background: rgba(136, 146, 176, 0.08);
      color: #8892b0;
      border-color: rgba(136, 146, 176, 0.15);
    }

    .badge--method {
      background: rgba(168, 85, 247, 0.1);
      color: #a855f7;
      border-color: rgba(168, 85, 247, 0.25);
      text-shadow: 0 0 8px rgba(168, 85, 247, 0.3);
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

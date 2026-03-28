import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

type BadgeType = 'type' | 'habitability' | 'method' | 'controversial' | 'visibility';

@Component({
  selector: 'app-stat-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span class="badge" [class]="'badge--' + type()" [attr.data-value]="value()">
      {{ getTranslationKey() | translate }}
    </span>
  `,
  styles: `
    @keyframes controversialPulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(245, 158, 11, 0.2); }
      50% { opacity: 0.8; box-shadow: 0 0 14px rgba(245, 158, 11, 0.4); }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
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

    .badge--controversial {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border-color: rgba(245, 158, 11, 0.3);
      text-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
      animation: controversialPulse 2.5s ease-in-out infinite;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 1.5px;
    }

    .badge--visibility {
      background: rgba(34, 211, 238, 0.08);
      color: #22d3ee;
      border-color: rgba(34, 211, 238, 0.2);
      text-shadow: 0 0 6px rgba(34, 211, 238, 0.3);
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  `,
})
export class StatBadgeComponent {
  type = input.required<BadgeType>();
  value = input.required<string>();

  getTranslationKey(): string {
    const val = this.value();
    if (!val) return '';

    if (this.type() === 'type') {
      return `filters.planetTypes.${val}`;
    } else if (this.type() === 'habitability') {
      return `filters.habitabilityOptions.${val}`;
    } else if (this.type() === 'method') {
      return `methodsData.methods.${val}.title`;
    } else if (this.type() === 'controversial') {
      return 'badges.controversial';
    } else if (this.type() === 'visibility') {
      return 'badges.nakedEye';
    }

    return val
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card" [class.skeleton-card--list]="viewMode() === 'list'">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
        <div class="skeleton-badges">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
        </div>
        <div class="skeleton-stats">
          <div class="skeleton-stat"></div>
          <div class="skeleton-stat"></div>
          <div class="skeleton-stat"></div>
          <div class="skeleton-stat"></div>
        </div>
      </div>
      <div class="skeleton-year"></div>
    </div>
  `,
  styles: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; border-color: rgba(77, 138, 255, 0.05); }
      50% { opacity: 0.7; border-color: rgba(77, 138, 255, 0.1); }
    }

    .skeleton-card {
      display: flex;
      flex-direction: column;
      padding: 20px;
      background: rgba(15, 20, 40, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(77, 138, 255, 0.06);
      border-radius: 20px;
      gap: 12px;
      animation: pulseGlow 2s ease-in-out infinite;
    }

    .skeleton-card--list {
      flex-direction: row;
      align-items: center;
    }

    .skeleton-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(
        90deg,
        rgba(77, 138, 255, 0.03) 25%,
        rgba(77, 138, 255, 0.08) 50%,
        rgba(77, 138, 255, 0.03) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
      flex-shrink: 0;
    }

    .skeleton-card--list .skeleton-avatar {
      width: 48px;
      height: 48px;
    }

    .skeleton-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-title,
    .skeleton-subtitle,
    .skeleton-badge,
    .skeleton-stat,
    .skeleton-year {
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(77, 138, 255, 0.03) 25%,
        rgba(77, 138, 255, 0.07) 50%,
        rgba(77, 138, 255, 0.03) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }

    .skeleton-title {
      height: 20px;
      width: 60%;
    }

    .skeleton-subtitle {
      height: 14px;
      width: 40%;
    }

    .skeleton-badges {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .skeleton-badge {
      height: 24px;
      width: 80px;
      border-radius: 12px;
    }

    .skeleton-stats {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }

    .skeleton-stat {
      height: 16px;
    }

    .skeleton-year {
      height: 14px;
      width: 40px;
    }
  `,
})
export class SkeletonCardComponent {
  viewMode = input<'grid' | 'list'>('grid');
}

import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="empty-state">
      <div class="empty-illustration">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Animated stars -->
          <circle cx="30" cy="40" r="1.5" fill="#ffffff" opacity="0.6">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="170" cy="30" r="1" fill="#ffffff" opacity="0.4">
            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="160" r="1.5" fill="#ffffff" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="150" r="1" fill="#ffffff" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.5;0.1" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="20" r="1" fill="#ffffff" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="170" r="1.2" fill="#4d8aff" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.5;0.1" dur="4s" repeatCount="indefinite" />
          </circle>

          <!-- Pulsing galaxy -->
          <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="rgba(77, 138, 255, 0.2)" stroke-width="2" transform="rotate(-15 100 100)">
            <animate attributeName="rx" values="58;62;58" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="100" cy="100" rx="45" ry="18" fill="none" stroke="rgba(168, 85, 247, 0.3)" stroke-width="1.5" transform="rotate(-15 100 100)">
            <animate attributeName="rx" values="43;47;43" dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="100" cy="100" rx="30" ry="12" fill="none" stroke="rgba(34, 211, 238, 0.3)" stroke-width="1" transform="rotate(-15 100 100)">
            <animate attributeName="rx" values="28;32;28" dur="2.5s" repeatCount="indefinite" />
          </ellipse>

          <!-- Center glow -->
          <circle cx="100" cy="100" r="10" fill="url(#galaxy-center)">
            <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
          </circle>

          <defs>
            <radialGradient id="galaxy-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
              <stop offset="30%" stop-color="#4d8aff" stop-opacity="0.5" />
              <stop offset="70%" stop-color="#a855f7" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <h3 class="empty-title">{{ 'emptyState.title' | translate }}</h3>
      <p class="empty-message">
        {{ 'emptyState.message' | translate }}
      </p>
      <button class="empty-action" (click)="clearFilters.emit()">
        {{ 'common.clearFilters' | translate }}
      </button>
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .empty-illustration {
      width: 180px;
      height: 180px;
      margin-bottom: 32px;
      filter: drop-shadow(0 0 20px rgba(77, 138, 255, 0.2));
    }

    .empty-illustration svg {
      width: 100%;
      height: 100%;
    }

    .empty-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      background: linear-gradient(135deg, #e8eeff, #4d8aff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
    }

    .empty-message {
      font-size: 14px;
      color: #8892b0;
      margin-bottom: 28px;
      max-width: 300px;
      line-height: 1.6;
    }

    .empty-action {
      padding: 12px 24px;
      background: rgba(77, 138, 255, 0.1);
      border: 1px solid rgba(77, 138, 255, 0.3);
      border-radius: 12px;
      color: #4d8aff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .empty-action:hover {
      background: rgba(77, 138, 255, 0.2);
      box-shadow: 0 0 25px rgba(77, 138, 255, 0.2);
      transform: translateY(-2px);
    }
  `,
})
export class EmptyStateComponent {
  clearFilters = output<void>();
}

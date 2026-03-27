import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-illustration">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Estrellas de fondo -->
          <circle cx="30" cy="40" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="170" cy="30" r="1" fill="#ffffff" opacity="0.4" />
          <circle cx="150" cy="160" r="1.5" fill="#ffffff" opacity="0.5" />
          <circle cx="40" cy="150" r="1" fill="#ffffff" opacity="0.3" />
          <circle cx="100" cy="20" r="1" fill="#ffffff" opacity="0.4" />
          
          <!-- Galaxia espiral simplificada -->
          <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="rgba(94, 142, 255, 0.2)" stroke-width="2" transform="rotate(-15 100 100)" />
          <ellipse cx="100" cy="100" rx="45" ry="18" fill="none" stroke="rgba(168, 85, 247, 0.3)" stroke-width="1.5" transform="rotate(-15 100 100)" />
          <ellipse cx="100" cy="100" rx="30" ry="12" fill="none" stroke="rgba(94, 142, 255, 0.4)" stroke-width="1" transform="rotate(-15 100 100)" />
          
          <!-- Centro brillante -->
          <circle cx="100" cy="100" r="8" fill="url(#galaxy-center)" />
          
          <defs>
            <radialGradient id="galaxy-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
              <stop offset="50%" stop-color="#5e8eff" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#5e8eff" stop-opacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <h3 class="empty-title">No se encontraron planetas</h3>
      <p class="empty-message">
        Intenta ajustar los filtros o realizar una nueva búsqueda
      </p>
      <button class="empty-action" (click)="clearFilters.emit()">
        Limpiar filtros
      </button>
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-illustration {
      width: 160px;
      height: 160px;
      margin-bottom: 24px;
    }

    .empty-illustration svg {
      width: 100%;
      height: 100%;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #f0f4ff;
      margin-bottom: 8px;
    }

    .empty-message {
      font-size: 14px;
      color: #8892b0;
      margin-bottom: 24px;
      max-width: 280px;
    }

    .empty-action {
      padding: 10px 20px;
      background: rgba(94, 142, 255, 0.15);
      border: 1px solid rgba(94, 142, 255, 0.4);
      border-radius: 8px;
      color: #5e8eff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .empty-action:hover {
      background: rgba(94, 142, 255, 0.25);
    }
  `,
})
export class EmptyStateComponent {
  clearFilters = output<void>();
}

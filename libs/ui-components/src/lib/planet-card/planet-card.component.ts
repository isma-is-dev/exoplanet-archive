import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Exoplanet } from '@exodex/shared-types';
import { StatBadgeComponent } from '../stat-badge/stat-badge.component';
import { StatRowComponent } from '../stat-row/stat-row.component';
import { PlanetAvatarComponent } from '../planet-avatar/planet-avatar.component';

@Component({
  selector: 'app-planet-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, StatBadgeComponent, StatRowComponent, PlanetAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="planet-card" [class]="'planet-card--' + planet().planetType">
      <div class="card-glow"></div>
      <div class="card-index">#{{ planet().index | number:'4.0-0' }}</div>

      <div class="card-avatar">
        <app-planet-avatar [planet]="planet()" size="card" />
      </div>

      <div class="card-info">
        <h2 class="planet-name">{{ planet().name }}</h2>
        <span class="host-star">
          <svg class="star-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" fill="#f59e0b" stroke="#f59e0b" stroke-width="0.5" opacity="0.9"/>
          </svg>
          {{ planet().hostStar }}
        </span>

        <div class="card-badges">
          <app-stat-badge type="type" [value]="planet().planetType" />
          <app-stat-badge type="habitability" [value]="planet().habitabilityClass" />
        </div>

        <div class="card-stats">
          <app-stat-row [label]="'stats.radius' | translate" [value]="planet().radiusEarth" unit="R⊕" />
          <app-stat-row [label]="'stats.mass' | translate" [value]="planet().massEarth" unit="M⊕" />
          <app-stat-row [label]="'stats.temperature' | translate" [value]="planet().equilibriumTempK" unit="K" />
          <app-stat-row [label]="'stats.period' | translate" [value]="planet().orbitalPeriodDays" [unit]="'units.days' | translate" />
        </div>
      </div>

      <div class="card-year">{{ planet().discoveryYear }}</div>

      @if (planet().numberOfKnownPlanetsInSystem && planet().numberOfKnownPlanetsInSystem! > 1) {
        <a class="system-badge"
           [routerLink]="['/system', planet().hostStar]"
           (click)="$event.stopPropagation()"
           title="View {{ planet().hostStar }} system">
          <svg class="system-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6"/>
            <ellipse cx="8" cy="8" rx="6" ry="3"/>
          </svg>
          {{ 'components.planetCard.planets' | translate:{ count: planet().numberOfKnownPlanetsInSystem } }}
          <svg class="arrow-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      }
    </article>
  `,
  styles: `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }

    @keyframes borderGlow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .planet-card {
      --card-accent: rgba(77, 138, 255, 0.3);
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 20px;
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      contain: layout style;
      overflow: hidden;
    }

    .card-glow {
      position: absolute;
      inset: -1px;
      border-radius: 20px;
      background: linear-gradient(135deg, var(--card-accent), transparent 40%, transparent 60%, var(--card-accent));
      opacity: 0;
      transition: opacity 400ms ease;
      z-index: -1;
      filter: blur(1px);
    }

    .planet-card:hover {
      transform: translateY(-6px) scale(1.02);
      border-color: transparent;
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 30px var(--card-accent);
    }

    .planet-card:hover .card-glow {
      opacity: 1;
      animation: borderGlow 2s ease-in-out infinite;
    }

    .planet-card:hover .card-avatar {
      animation: float 3s ease-in-out infinite;
    }

    /* Planet type accent colors */
    .planet-card--rocky-terrestrial { --card-accent: rgba(139, 158, 106, 0.4); }
    .planet-card--super-earth { --card-accent: rgba(16, 185, 129, 0.4); }
    .planet-card--mini-neptune,
    .planet-card--neptunian { --card-accent: rgba(74, 144, 217, 0.4); }
    .planet-card--jovian,
    .planet-card--hot-jupiter { --card-accent: rgba(232, 169, 106, 0.4); }
    .planet-card--cold-giant { --card-accent: rgba(139, 164, 199, 0.4); }

    .card-index {
      position: absolute;
      top: 14px;
      left: 14px;
      font-family: 'Orbitron', monospace;
      font-size: 10px;
      font-weight: 700;
      color: rgba(77, 138, 255, 0.6);
      background: rgba(77, 138, 255, 0.08);
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid rgba(77, 138, 255, 0.12);
      letter-spacing: 1px;
    }

    .card-avatar {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
      margin-top: 8px;
      transition: filter 400ms ease;
    }

    .planet-card:hover .card-avatar {
      filter: drop-shadow(0 0 12px var(--card-accent));
    }

    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .planet-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #e8eeff;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 1px;
    }

    .host-star {
      font-size: 12px;
      color: #8892b0;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .star-icon {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
      filter: drop-shadow(0 0 3px rgba(245, 158, 11, 0.5));
    }

    .card-badges {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .card-stats {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .card-year {
      position: absolute;
      bottom: 14px;
      right: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(136, 146, 176, 0.5);
    }

    .system-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 500;
      color: rgba(109, 165, 255, 0.8);
      background: rgba(77, 138, 255, 0.08);
      border: 1px solid rgba(77, 138, 255, 0.12);
      border-radius: 8px;
      text-decoration: none;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      white-space: nowrap;
      letter-spacing: 0.3px;
    }

    .system-badge:hover {
      background: rgba(77, 138, 255, 0.18);
      border-color: rgba(77, 138, 255, 0.35);
      color: #9ac2ff;
      box-shadow: 0 0 16px rgba(77, 138, 255, 0.2);
      transform: translateY(-1px);
    }

    .system-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .arrow-icon {
      width: 10px;
      height: 10px;
      flex-shrink: 0;
      opacity: 0;
      transform: translateX(-4px);
      transition: all 200ms ease;
    }

    .system-badge:hover .arrow-icon {
      opacity: 1;
      transform: translateX(0);
    }

    @media (max-width: 480px) {
      .planet-card {
        padding: 16px;
      }

      .card-index {
        top: 10px;
        left: 10px;
        font-size: 9px;
        padding: 3px 8px;
      }

      .planet-name {
        font-size: 13px;
      }

      .host-star {
        font-size: 11px;
      }

      .card-year {
        bottom: 10px;
        right: 10px;
        font-size: 10px;
      }

      .system-badge {
        top: 10px;
        right: 10px;
        font-size: 9px;
        padding: 3px 8px;
      }
    }
  `,
})
export class PlanetCardComponent {
  planet = input.required<Exoplanet>();
  private translate = inject(TranslateService);
}

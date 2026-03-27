import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Exoplanet } from '@exodex/shared-types';
import { StatBadgeComponent } from '../stat-badge/stat-badge.component';
import { StatRowComponent } from '../stat-row/stat-row.component';
import { PlanetAvatarComponent } from '../planet-avatar/planet-avatar.component';

@Component({
  selector: 'app-planet-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, StatBadgeComponent, StatRowComponent, PlanetAvatarComponent],
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
        <span class="host-star">⭐ {{ planet().hostStar }}</span>

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
  `,
})
export class PlanetCardComponent {
  planet = input.required<Exoplanet>();
  private translate = inject(TranslateService);
}

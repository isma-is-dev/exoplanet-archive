import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exoplanet } from '@exodex/shared-types';
import { StatBadgeComponent } from '../stat-badge/stat-badge.component';
import { StatRowComponent } from '../stat-row/stat-row.component';
import { PlanetAvatarComponent } from '../planet-avatar/planet-avatar.component';

@Component({
  selector: 'app-planet-card',
  standalone: true,
  imports: [CommonModule, StatBadgeComponent, StatRowComponent, PlanetAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="planet-card" [class]="'planet-card--' + planet().planetType">
      <div class="card-index">#{{ planet().index | number:'4.0-0' }}</div>

      <div class="card-avatar">
        <app-planet-avatar [planet]="planet()" size="card" />
      </div>

      <div class="card-info">
        <h2 class="planet-name">{{ planet().name }}</h2>
        <span class="host-star">{{ planet().hostStar }}</span>

        <div class="card-badges">
          <app-stat-badge type="type" [value]="planet().planetType" />
          <app-stat-badge type="habitability" [value]="planet().habitabilityClass" />
        </div>

        <div class="card-stats">
          <app-stat-row label="Radio" [value]="planet().radiusEarth" unit="R⊕" />
          <app-stat-row label="Masa" [value]="planet().massEarth" unit="M⊕" />
          <app-stat-row label="Temp. eq." [value]="planet().equilibriumTempK" unit="K" />
          <app-stat-row label="Período" [value]="planet().orbitalPeriodDays" unit="días" />
        </div>
      </div>

      <div class="card-year">{{ planet().discoveryYear }}</div>
    </article>
  `,
  styles: `
    .planet-card {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      transition: all 250ms ease;
      cursor: pointer;
      contain: layout style;
    }

    .planet-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    }

    .planet-card--rocky-terrestrial:hover {
      box-shadow: 0 12px 32px rgba(139, 158, 106, 0.15);
      border-color: rgba(139, 158, 106, 0.2);
    }

    .planet-card--super-earth:hover {
      box-shadow: 0 12px 32px rgba(107, 184, 110, 0.15);
      border-color: rgba(107, 184, 110, 0.2);
    }

    .planet-card--mini-neptune:hover,
    .planet-card--neptunian:hover {
      box-shadow: 0 12px 32px rgba(74, 144, 217, 0.15);
      border-color: rgba(74, 144, 217, 0.2);
    }

    .planet-card--jovian:hover,
    .planet-card--hot-jupiter:hover {
      box-shadow: 0 12px 32px rgba(232, 169, 106, 0.15);
      border-color: rgba(232, 169, 106, 0.2);
    }

    .planet-card--cold-giant:hover {
      box-shadow: 0 12px 32px rgba(139, 164, 199, 0.15);
      border-color: rgba(139, 164, 199, 0.2);
    }

    .card-index {
      position: absolute;
      top: 12px;
      left: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      color: #4a5568;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: 6px;
    }

    .card-avatar {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .planet-name {
      font-size: 16px;
      font-weight: 600;
      color: #f0f4ff;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .host-star {
      font-size: 12px;
      color: #8892b0;
      margin-bottom: 12px;
    }

    .card-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .card-stats {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .card-year {
      position: absolute;
      bottom: 12px;
      right: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #8892b0;
    }
  `,
})
export class PlanetCardComponent {
  planet = input.required<Exoplanet>();
}

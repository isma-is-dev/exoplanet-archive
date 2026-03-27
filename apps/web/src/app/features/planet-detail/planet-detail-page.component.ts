import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, startWith } from 'rxjs';
import { ExoplanetApiService } from '../../core/services/exoplanet-api.service';
import { PlanetAvatarComponent, StatBadgeComponent, StatRowComponent } from '@exodex/ui-components';

@Component({
  selector: 'app-planet-detail-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, PlanetAvatarComponent, StatBadgeComponent, StatRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (planet(); as p) {
      <div class="planet-detail">
        <button class="back-btn" (click)="goBack()">
          ← {{ 'common.backToList' | translate }}
        </button>

        <div class="detail-layout">
          <div class="detail-left">
            <div class="planet-avatar-container">
              <app-planet-avatar [planet]="p" size="detail" />
            </div>
            <h1 class="planet-name">{{ p.name }}</h1>
            <div class="planet-meta">
              <span class="planet-index">#{{ p.index | number:'4.0-0' }}</span>
              <span class="planet-star">{{ p.hostStar }}</span>
            </div>
            <div class="planet-badges">
              <app-stat-badge type="type" [value]="p.planetType" />
              <app-stat-badge type="habitability" [value]="p.habitabilityClass" />
            </div>
            <div class="discovery-year">{{ 'common.discoveredIn' | translate: { year: p.discoveryYear } }}</div>
          </div>

          <div class="detail-right">
            <section class="detail-section">
              <h3>{{ 'sections.orbitalProperties' | translate }}</h3>
              <app-stat-row [label]="'stats.orbitalPeriod' | translate" [value]="p.orbitalPeriodDays" [unit]="'units.days' | translate" />
              <app-stat-row [label]="'stats.semiMajorAxis' | translate" [value]="p.semiMajorAxisAU" [unit]="'units.au' | translate" />
              <app-stat-row [label]="'stats.eccentricity' | translate" [value]="p.eccentricity" />
              <app-stat-row [label]="'stats.inclination' | translate" [value]="p.inclinationDeg" [unit]="'units.deg' | translate" />
            </section>

            <section class="detail-section">
              <h3>{{ 'sections.physicalProperties' | translate }}</h3>
              <app-stat-row [label]="'stats.radius' | translate" [value]="p.radiusEarth" unit="R⊕" />
              <app-stat-row [label]="'stats.mass' | translate" [value]="p.massEarth" unit="M⊕" />
              <app-stat-row [label]="'stats.density' | translate" [value]="p.densityGCC" [unit]="'units.density' | translate" />
              <app-stat-row [label]="'stats.gravity' | translate" [value]="p.gravityMS2" [unit]="'units.gravity' | translate" />
              <app-stat-row [label]="'stats.temperature' | translate" [value]="p.equilibriumTempK" unit="K" />
            </section>

            <section class="detail-section">
              <h3>{{ 'sections.hostStar' | translate }}</h3>
              <app-stat-row [label]="'stats.stellarTemperature' | translate" [value]="p.stellarTempK" unit="K" />
              <app-stat-row [label]="'stats.stellarRadius' | translate" [value]="p.stellarRadiusSun" unit="R☉" />
              <app-stat-row [label]="'stats.stellarMass' | translate" [value]="p.stellarMassSun" unit="M☉" />
              <app-stat-row [label]="'stats.stellarMetallicity' | translate" [value]="p.stellarMetallicity" />
              <app-stat-row [label]="'stats.stellarAge' | translate" [value]="p.stellarAge" [unit]="'units.gyr' | translate" />
            </section>

            <section class="detail-section">
              <h3>{{ 'sections.discovery' | translate }}</h3>
              <app-stat-row [label]="'stats.discoveryMethod' | translate" [value]="p.discoveryMethod" />
              <app-stat-row [label]="'stats.discoveryYear' | translate" [value]="p.discoveryYear" />
              <app-stat-row [label]="'stats.discoveryFacility' | translate" [value]="p.discoveryFacility" />
              <app-stat-row [label]="'stats.telescope' | translate" [value]="p.telescope" />
            </section>
          </div>
        </div>
      </div>
    }

    @if (error()) {
      <div class="error-state">
        <h2>{{ 'common.notFound' | translate }}</h2>
        <p>{{ 'common.notFoundDescription' | translate }}</p>
        <button (click)="goBack()">{{ 'common.backToList' | translate }}</button>
      </div>
    }
  `,
  styles: `
    .planet-detail {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      color: #8892b0;
      font-size: 14px;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #f0f4ff;
    }

    .detail-layout {
      display: grid;
      grid-template-columns: 40% 60%;
      gap: 48px;
    }

    .detail-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .planet-avatar-container {
      margin-bottom: 24px;
    }

    .planet-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #f0f4ff;
      margin-bottom: 8px;
    }

    .planet-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .planet-index {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #5e8eff;
      background: rgba(94, 142, 255, 0.1);
      padding: 4px 10px;
      border-radius: 6px;
    }

    .planet-star {
      font-size: 14px;
      color: #8892b0;
    }

    .planet-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .discovery-year {
      font-size: 13px;
      color: #4a5568;
    }

    .detail-right {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .detail-section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 20px;
    }

    .detail-section h3 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #8892b0;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .error-state {
      text-align: center;
      padding: 48px;
    }

    .error-state h2 {
      color: #f0f4ff;
      margin-bottom: 8px;
    }

    .error-state p {
      color: #8892b0;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .detail-layout {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }
  `,
})
export class PlanetDetailPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ExoplanetApiService);

  error = signal(false);

  planet = toSignal(
    this.route.params.pipe(
      switchMap((params) =>
        this.apiService.getExoplanetById$(params['id']).pipe(
          catchError(() => {
            this.error.set(true);
            return of(null);
          })
        )
      ),
      startWith(null)
    )
  );

  goBack(): void {
    this.router.navigate(['/']);
  }
}

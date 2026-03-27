import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, shareReplay } from 'rxjs';
import { ExoplanetApiService } from '../../core/services/exoplanet-api.service';
import { PlanetAvatarComponent, StatBadgeComponent, StatRowComponent, SystemOrbitPreviewComponent } from '@exodex/ui-components';
import { renderStar } from '@exodex/planet-renderer';
import { getTelescopeWikiLink } from '../../core/constants/telescopes';

@Component({
  selector: 'app-planet-detail-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, PlanetAvatarComponent, StatBadgeComponent, StatRowComponent, SystemOrbitPreviewComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (planet(); as p) {
      <div class="planet-detail">
        <button class="back-btn" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {{ 'common.backToList' | translate }}
        </button>

        <div class="detail-layout">
          <div class="detail-left">
            <div class="planet-hero">
              <div class="hero-glow"></div>
              <div class="orbital-ring ring-1"></div>
              <div class="orbital-ring ring-2"></div>
              <div class="planet-avatar-container">
                <app-planet-avatar [planet]="p" size="detail" />
              </div>
            </div>
            <h1 class="planet-name">{{ p.name }}</h1>
            <div class="planet-meta">
              <span class="planet-index">#{{ p.index | number:'4.0-0' }}</span>
              <span class="meta-divider">·</span>
              <span class="planet-star">
                <svg class="star-svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" fill="#f59e0b" stroke="#f59e0b" stroke-width="0.5" opacity="0.9"/></svg>
                {{ p.hostStar }}
              </span>
            </div>
            <div class="planet-badges">
              <app-stat-badge type="type" [value]="p.planetType" />
              <app-stat-badge type="habitability" [value]="p.habitabilityClass" />
            </div>
            <div class="discovery-year">{{ 'common.discoveredIn' | translate: { year: p.discoveryYear } }}</div>
          </div>

          <div class="detail-right">
            <section class="detail-section">
              <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" stroke="#4d8aff" stroke-width="1.2"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/><circle cx="10" cy="10" r="1" fill="#4d8aff"/></svg></span> {{ 'sections.orbitalProperties' | translate }}</h3>
              
              @if (systemPlanets().length > 0) {
                <app-system-orbit-preview 
                  [planets]="systemPlanets()" 
                  [currentPlanetId]="p.id"
                  [systemName]="p.hostStar" />

                  <a [routerLink]="['/system', p.hostStar]" class="full-system-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Explore Full System
                  </a>
                }

              <app-stat-row [label]="'stats.orbitalPeriod' | translate" [value]="p.orbitalPeriodDays" [unit]="'units.days' | translate" />
              <app-stat-row [label]="'stats.semiMajorAxis' | translate" [value]="p.semiMajorAxisAU" [unit]="'units.au' | translate" />
              <app-stat-row [label]="'stats.eccentricity' | translate" [value]="p.eccentricity" />
              <app-stat-row [label]="'stats.inclination' | translate" [value]="p.inclinationDeg" [unit]="'units.deg' | translate" />
            </section>

            <section class="detail-section">
              <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" stroke="#a855f7" stroke-width="1.2"><circle cx="10" cy="10" r="8"/><path d="M10 2v16M2 10h16" opacity="0.3"/><circle cx="10" cy="10" r="4" fill="rgba(168,85,247,0.2)"/></svg></span> {{ 'sections.physicalProperties' | translate }}</h3>
              <app-stat-row [label]="'stats.radius' | translate" [value]="p.radiusEarth" unit="R⊕" />
              <app-stat-row [label]="'stats.mass' | translate" [value]="p.massEarth" unit="M⊕" />
              <app-stat-row [label]="'stats.density' | translate" [value]="p.densityGCC" [unit]="'units.density' | translate" />
              <app-stat-row [label]="'stats.gravity' | translate" [value]="p.gravityMS2" [unit]="'units.gravity' | translate" />
              <app-stat-row [label]="'stats.temperature' | translate" [value]="p.equilibriumTempK" unit="K" />
            </section>

            <section class="detail-section">
              <h3>
                <div class="section-title-wrap">
                  <span class="section-icon"><svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="4" fill="#f59e0b" opacity="0.8"/><path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.3 4.3l2.1 2.1M13.6 13.6l2.1 2.1M4.3 15.7l2.1-2.1M13.6 6.4l2.1-2.1" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round"/></svg></span> 
                  {{ 'sections.hostStar' | translate }}
                </div>
                <div class="host-star-badges" *ngIf="p.hostStar">
                  <span class="star-name-badge">{{ p.hostStar }}</span>
                  <span class="star-type-badge" *ngIf="starData()?.spectralClass"
                        [style.color]="starData()?.primaryColor"
                        [style.borderColor]="starData()?.primaryColor"
                        [style.backgroundColor]="starData()?.primaryColor + '15'">
                    Type {{ starData()?.spectralClass }}
                  </span>
                </div>
              </h3>
              @if (starData()?.svg) {
                <div class="host-star-avatar-container">
                  <div class="host-star-avatar" [innerHTML]="starData()?.svg"></div>
                </div>
              }
              <app-stat-row [label]="'stats.stellarTemperature' | translate" [value]="p.stellarTempK" unit="K" />
              <app-stat-row [label]="'stats.stellarRadius' | translate" [value]="p.stellarRadiusSun" unit="R☉" />
              <app-stat-row [label]="'stats.stellarMass' | translate" [value]="p.stellarMassSun" unit="M☉" />
              <app-stat-row [label]="'stats.stellarMetallicity' | translate" [value]="p.stellarMetallicity" />
              <app-stat-row [label]="'stats.stellarAge' | translate" [value]="p.stellarAge" [unit]="'units.gyr' | translate" />
            </section>

            <section class="detail-section">
              <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" stroke="#22d3ee" stroke-width="1.2" stroke-linecap="round"><path d="M14 3l3 5-10 6-3-5z" fill="rgba(34,211,238,0.15)"/><path d="M7 14l-3 4"/><path d="M4 18h6"/><circle cx="16" cy="4" r="1.5" fill="rgba(34,211,238,0.3)"/></svg></span> {{ 'sections.discovery' | translate }}</h3>
              <app-stat-row [label]="'stats.discoveryMethod' | translate" [value]="p.discoveryMethod" [href]="getDiscoveryMethodLink(p.discoveryMethod)" [isExternalLink]="false" />
              <app-stat-row [label]="'stats.discoveryYear' | translate" [value]="p.discoveryYear" />
              <app-stat-row [label]="'stats.discoveryFacility' | translate" [value]="p.discoveryFacility" />
              <app-stat-row [label]="'stats.telescope' | translate" [value]="p.telescope" [href]="getTelescopeWikiLink(p.telescope)" [isExternalLink]="true" />
            </section>

            <div class="data-attribution">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 6v4M10 13h.01" stroke-linecap="round" />
              </svg>
              <span>
                Data sourced from the
                <a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noopener noreferrer" class="nasa-link">
                  NASA Exoplanet Archive
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    }

    @if (error()) {
      <div class="error-state">
        <h2>{{ 'common.notFound' | translate }}</h2>
        <p>{{ 'common.notFoundDescription' | translate }}</p>
        <button class="error-btn" (click)="goBack()">{{ 'common.backToList' | translate }}</button>
      </div>
    }
  `,
  styles: `
    @keyframes floatPlanet {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    @keyframes orbitSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes heroGlow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .planet-detail {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 32px;
      padding: 10px 20px;
      background: rgba(15, 20, 40, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(77, 138, 255, 0.15);
      border-radius: 12px;
      color: #8892b0;
      font-size: 14px;
      cursor: pointer;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'Inter', sans-serif;
    }

    .back-btn:hover {
      background: rgba(77, 138, 255, 0.1);
      color: #e8eeff;
      border-color: rgba(77, 138, 255, 0.3);
      box-shadow: 0 0 20px rgba(77, 138, 255, 0.15);
      transform: translateX(-4px);
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

    /* Hero planet with orbital rings */
    .planet-hero {
      position: relative;
      width: 320px;
      height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
    }

    .hero-glow {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(77, 138, 255, 0.15) 0%, transparent 70%);
      animation: heroGlow 4s ease-in-out infinite;
      pointer-events: none;
    }

    .orbital-ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(77, 138, 255, 0.1);
      pointer-events: none;
    }

    .ring-1 {
      width: 110%;
      height: 110%;
      animation: orbitSpin 20s linear infinite;
    }

    .ring-2 {
      width: 130%;
      height: 130%;
      border-color: rgba(168, 85, 247, 0.08);
      animation: orbitSpin 30s linear infinite reverse;
    }

    .planet-avatar-container {
      animation: floatPlanet 6s ease-in-out infinite;
      filter: drop-shadow(0 0 20px rgba(77, 138, 255, 0.2));
    }

    .planet-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      background: linear-gradient(135deg, #e8eeff 0%, #4d8aff 50%, #a855f7 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 6s ease infinite;
      margin-bottom: 12px;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .planet-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .planet-index {
      font-family: 'Orbitron', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #4d8aff;
      background: rgba(77, 138, 255, 0.1);
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid rgba(77, 138, 255, 0.15);
      letter-spacing: 1px;
    }

    .meta-divider {
      color: #4a5568;
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
      font-family: 'Inter', sans-serif;
    }

    .detail-right {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .detail-section {
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
      transition: border-color 300ms ease, box-shadow 300ms ease;
    }

    .detail-section:hover {
      border-color: rgba(77, 138, 255, 0.12);
      box-shadow: 0 0 20px rgba(77, 138, 255, 0.05);
    }

    .detail-section h3 {
      font-family: 'Orbitron', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #4d8aff;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(77, 138, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .host-star-badges {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .star-name-badge {
      color: #e8eeff;
      font-family: 'Inter', sans-serif;
      text-transform: none;
      letter-spacing: normal;
      font-size: 13px;
      font-weight: 600;
    }

    .star-type-badge {
      font-family: 'JetBrains Mono', monospace;
      border: 1px solid;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 600;
    }

    .host-star-avatar-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
      margin-top: 8px;
    }

    .host-star-avatar {
      width: 140px;
      height: 140px;
      filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.15));
      animation: floatPlanet 8s ease-in-out infinite reverse;
    }

    .host-star-avatar :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .section-icon {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .section-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .star-svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5));
    }

    .planet-star {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .error-state {
      text-align: center;
      padding: 48px;
      animation: fadeInUp 600ms ease;
    }

    .error-state h2 {
      color: #e8eeff;
      margin-bottom: 8px;
    }

    .error-state p {
      color: #8892b0;
      margin-bottom: 24px;
    }

    .error-btn {
      padding: 12px 24px;
      background: rgba(77, 138, 255, 0.15);
      border: 1px solid rgba(77, 138, 255, 0.3);
      border-radius: 12px;
      color: #4d8aff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 300ms ease;
    }

    .error-btn:hover {
      background: rgba(77, 138, 255, 0.25);
      box-shadow: 0 0 20px rgba(77, 138, 255, 0.2);
    }

    .data-attribution {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 16px;
      margin-top: 8px;
      background: rgba(10, 14, 35, 0.4);
      border: 1px solid rgba(77, 138, 255, 0.06);
      border-radius: 12px;
      font-size: 11px;
      color: #5a6177;
      font-family: 'Inter', sans-serif;
    }

    .nasa-link {
      color: #6da5ff;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: all 200ms ease;
    }

    .nasa-link:hover {
      color: #9ac2ff;
      text-shadow: 0 0 8px rgba(154, 194, 255, 0.3);
    }

    .full-system-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      margin-top: -12px;
      margin-bottom: 24px;
      background: rgba(77, 138, 255, 0.1);
      border: 1px solid rgba(77, 138, 255, 0.2);
      border-radius: 12px;
      color: #6da5ff;
      font-size: 13px;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      transition: all 300ms ease;
    }

    .full-system-btn:hover {
      background: rgba(77, 138, 255, 0.15);
      border-color: rgba(77, 138, 255, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(77, 138, 255, 0.15);
    }

    @media (max-width: 768px) {
      .detail-layout {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .planet-hero {
        width: 240px;
        height: 240px;
      }

      .planet-name {
        font-size: 1.5rem;
      }
    }
  `,
})
export class PlanetDetailPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ExoplanetApiService);
  private sanitizer = inject(DomSanitizer);

  error = signal(false);

  planet$ = this.route.params.pipe(
    switchMap((params) =>
      this.apiService.getExoplanetById$(params['id']).pipe(
        catchError(() => {
          this.error.set(true);
          return of(null);
        })
      )
    ),
    shareReplay(1)
  );

  planet = toSignal(this.planet$, { initialValue: null });

  systemPlanets = toSignal(
    this.planet$.pipe(
      switchMap((p) => {
        if (!p || !p.hostStar) return of([]);
        return this.apiService.getSystemPlanets$(p.hostStar);
      })
    ),
    { initialValue: [] }
  );

  starData = computed(() => {
    const p = this.planet();
    if (!p || (!p.stellarTempK && !p.stellarMassSun && !p.stellarRadiusSun)) return null;
    
    const result = renderStar({
      stellarTempK: p.stellarTempK,
      stellarRadiusSun: p.stellarRadiusSun,
      stellarMassSun: p.stellarMassSun,
      numberOfStarsInSystem: p.numberOfStarsInSystem,
      size: 'card', 
      animationsEnabled: true
    }, p.hostStar);
    
    return {
      svg: this.sanitizer.bypassSecurityTrustHtml(result.svgString),
      primaryColor: result.primaryColor,
      spectralClass: result.spectralClass
    };
  });

  getTelescopeWikiLink = getTelescopeWikiLink;

  getDiscoveryMethodLink(method: string | null): string | null {
    if (!method) return null;
    return '/method/' + method.toLowerCase().replace(/\s+/g, '-');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of, shareReplay } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ExoplanetApiService } from '../../core/services/exoplanet-api.service';
import { PlanetAvatarComponent, StatRowComponent } from '@exodex/ui-components';
import { renderStar } from '@exodex/planet-renderer';
import { Exoplanet } from '@exodex/shared-types';

@Component({
  selector: 'app-system-detail-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, PlanetAvatarComponent, StatRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="system-container">
      <button class="back-btn" routerLink="/">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Exodex
      </button>

      @if (planets() && planets().length > 0) {
        <div class="system-header">
          <div class="header-content">
            <h1 class="system-name">{{ systemName() }} System</h1>
            <p class="system-subtitle">{{ planets().length }} {{ planets().length === 1 ? 'planet' : 'planets' }} discovered in this system.</p>
          </div>
        </div>

        <div class="system-visualizer-wrapper">
          <div class="system-visualizer">
            
            <!-- Host Star -->
            <div class="star-section">
              <div class="star-avatar-container" [style.box-shadow]="'0 0 100px ' + (starData()?.primaryColor || '#fbd38d') + '40'">
                <div class="star-avatar" [innerHTML]="starData()?.svg"></div>
              </div>
              <div class="star-info">
                <h3>{{ systemName() }}</h3>
                <span class="spectral-badge" 
                      [style.color]="starData()?.primaryColor" 
                      [style.borderColor]="starData()?.primaryColor"
                      [style.backgroundColor]="starData()?.primaryColor + '15'">
                  Type {{ starData()?.spectralClass }}
                </span>
                <div class="star-stats">
                  <div><span class="label">Temp:</span> {{ planets()[0].stellarTempK || 'N/A' }} K</div>
                  <div><span class="label">Mass:</span> {{ planets()[0].stellarMassSun || 'N/A' }} M☉</div>
                  <div><span class="label">Radius:</span> {{ planets()[0].stellarRadiusSun || 'N/A' }} R☉</div>
                </div>
              </div>
            </div>

            <!-- Orbit Track Line -->
            <div class="orbit-timeline"></div>

            <!-- Planets -->
            <div class="planets-section">
              <div class="spacer" style="width: 100px;"></div>
              @for (planet of mappedPlanets(); track planet.planet.id; let i = $index) {
                <a class="planet-node" [routerLink]="['/planeta', planet.planet.id]" [style.margin-left.px]="planet.spacing">
                  <div class="orbit-connect"></div>
                  <div class="planet-avatar-wrapper" [style.transform]="'scale(' + planet.scale + ')'">
                    <app-planet-avatar [planet]="planet.planet" size="card" />
                  </div>
                  <div class="planet-info-card">
                    <h4>{{ planet.planet.name }}</h4>
                    <div class="planet-meta">{{ planet.planet.planetType.replace('-', ' ') }}</div>
                    
                    <div class="mini-stats">
                      <div class="mini-stat">
                        <span class="icon">◷</span> {{ planet.planet.orbitalPeriodDays | number:'1.0-2' }} d
                      </div>
                      <div class="mini-stat">
                        <span class="icon">⟷</span> {{ planet.planet.semiMajorAxisAU | number:'1.0-3' }} AU
                      </div>
                      <div class="mini-stat">
                        <span class="icon">◎</span> {{ planet.planet.radiusEarth | number:'1.0-2' }} R⊕
                      </div>
                    </div>
                  </div>
                </a>
              }
              <div class="spacer" style="width: 150px;"></div>
            </div>

          </div>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <h2>System not found</h2>
          <p>We couldn't locate any planets for this star system.</p>
        </div>
      } @else {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Scanning star system {{ systemName() }}...</p>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .system-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 24px;
      animation: fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1);
      min-height: calc(100vh - 80px);
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      padding: 10px 20px;
      background: rgba(15, 20, 40, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(77, 138, 255, 0.15);
      border-radius: 12px;
      color: #8892b0;
      font-size: 14px;
      cursor: pointer;
      transition: all 300ms ease;
      font-family: 'Inter', sans-serif;
    }

    .back-btn:hover {
      background: rgba(77, 138, 255, 0.1);
      color: #e8eeff;
      border-color: rgba(77, 138, 255, 0.3);
      transform: translateX(-4px);
    }

    .system-header {
      margin-bottom: 40px;
    }

    .system-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 2.5rem;
      font-weight: 900;
      color: #e8eeff;
      margin: 0 0 8px 0;
      letter-spacing: 1px;
    }

    .system-subtitle {
      color: #8892b0;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
      margin: 0;
    }

    .system-visualizer-wrapper {
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 40px;
      scrollbar-width: thin;
      scrollbar-color: rgba(77, 138, 255, 0.3) rgba(10, 14, 28, 0.3);
      background: radial-gradient(ellipse at left, rgba(15, 20, 40, 0.5) 0%, rgba(10, 14, 28, 0) 70%);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .system-visualizer-wrapper::-webkit-scrollbar {
      height: 8px;
    }
    .system-visualizer-wrapper::-webkit-scrollbar-track {
      background: rgba(10, 14, 28, 0.3);
      border-radius: 4px;
    }
    .system-visualizer-wrapper::-webkit-scrollbar-thumb {
      background: rgba(77, 138, 255, 0.3);
      border-radius: 4px;
    }

    .system-visualizer {
      display: flex;
      align-items: center;
      min-width: min-content;
      padding: 40px 0;
      position: relative;
    }

    /* Track line across the whole visualizer */
    .orbit-timeline {
      position: absolute;
      top: 50%;
      left: 170px; /* start inside star radius */
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
      z-index: 0;
      box-shadow: 0 0 10px rgba(255,255,255,0.1);
    }

    .star-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
      width: 300px;
      flex-shrink: 0;
      z-index: 10;
      position: relative;
    }

    .star-avatar-container {
      width: 340px;
      height: 340px;
      border-radius: 50%;
      background: #0a0e1c;
      /* Left flush so it looks cut off like a real map */
      margin-left: -170px; 
    }

    .star-avatar {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .star-avatar :deep(svg) {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .star-info {
      text-align: left;
      width: 100%;
      padding-left: 24px;
      margin-top: -30px;
    }

    .star-info h3 {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.4rem;
      color: #e8eeff;
      margin: 0 0 8px 0;
    }

    .spectral-badge {
      display: inline-block;
      padding: 4px 8px;
      font-size: 11px;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: 1px solid;
      border-radius: 6px;
      margin-bottom: 16px;
    }

    .star-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13px;
      color: #a0aec0;
      font-family: 'Inter', sans-serif;
      background: rgba(10, 14, 28, 0.6);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.05);
      width: 180px;
    }
    
    .star-stats .label {
      color: #5a6177;
      display: inline-block;
      width: 55px;
    }

    .planets-section {
      display: flex;
      align-items: center;
      z-index: 10;
    }

    .planet-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      text-decoration: none;
      transition: transform 0.3s ease;
      cursor: pointer;
    }

    .planet-node:hover {
      transform: translateY(-5px);
    }

    .planet-avatar-wrapper {
      width: 100px;
      height: 100px;
      margin-bottom: 24px;
      filter: drop-shadow(0 0 15px rgba(0,0,0,0.5));
      transition: filter 0.3s ease;
      /* Visual centering on the timeline */
      transform-origin: center center;
    }

    .planet-node:hover .planet-avatar-wrapper {
      filter: drop-shadow(0 0 25px rgba(77, 138, 255, 0.8));
    }

    .planet-info-card {
      background: rgba(15, 20, 40, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(77, 138, 255, 0.15);
      border-radius: 12px;
      padding: 16px;
      width: 180px;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .planet-node:hover .planet-info-card {
      border-color: rgba(77, 138, 255, 0.4);
      background: rgba(20, 26, 50, 0.95);
      box-shadow: 0 8px 25px rgba(77, 138, 255, 0.15);
    }

    .planet-info-card h4 {
      font-family: 'Orbitron', sans-serif;
      font-size: 14px;
      color: #e8eeff;
      margin: 0 0 6px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .planet-meta {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6da5ff;
      margin-bottom: 14px;
      font-family: 'Inter', sans-serif;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 8px;
    }

    .mini-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
    }

    .mini-stat {
      font-size: 12px;
      color: #a0aec0;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mini-stat .icon {
      color: #5a6177;
      font-size: 12px;
      width: 14px;
      text-align: center;
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      text-align: center;
    }

    .loading-state p, .error-state p {
      color: #8892b0;
      font-family: 'Inter', sans-serif;
      margin-top: 16px;
    }

    .error-state h2 {
      color: #ef4444;
      font-family: 'Orbitron', sans-serif;
      margin: 0;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(77, 138, 255, 0.1);
      border-top-color: #4d8aff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  `
})
export class SystemDetailPageComponent {
  private route = inject(ActivatedRoute);
  private apiService = inject(ExoplanetApiService);
  private sanitizer = inject(DomSanitizer);

  systemName = toSignal(
    this.route.params.pipe(map(p => p['name'] as string)),
    { initialValue: '' }
  );

  error = signal(false);

  planets$ = this.route.params.pipe(
    switchMap(params => {
      const name = params['name'];
      if (!name) return of([]);
      return this.apiService.getSystemPlanets$(name).pipe(
        catchError(() => {
          this.error.set(true);
          return of([]);
        })
      );
    }),
    shareReplay(1)
  );

  planets = toSignal(this.planets$, { initialValue: [] as Exoplanet[] });

  starData = computed(() => {
    const list = this.planets();
    if (!list || list.length === 0) return null;
    const p = list[0]; 
    
    const params = {
      stellarTempK: p.stellarTempK,
      stellarRadiusSun: p.stellarRadiusSun,
      stellarMassSun: p.stellarMassSun,
      size: 'detail' as const,
      animationsEnabled: true,
      numberOfStarsInSystem: 1 // Only show the main star in the system detail view for now
    };
    const { svgString, primaryColor, spectralClass } = renderStar(params, p.hostStar); 
    return {
      svg: this.sanitizer.bypassSecurityTrustHtml(svgString),
      primaryColor,
      spectralClass
    };
  });

  mappedPlanets = computed(() => {
    const list = this.planets() || [];
    if (list.length === 0) return [];

    const sorted = [...list].sort((a, b) => {
      const aVal = a.semiMajorAxisAU || a.orbitalPeriodDays || 0;
      const bVal = b.semiMajorAxisAU || b.orbitalPeriodDays || 0;
      return aVal - bVal;
    });

    const radii = sorted.map(p => p.radiusEarth || 1);
    const minPR = Math.min(...radii);
    const maxPR = Math.max(...radii);

    return sorted.map((planet, index) => {
      let scale = 1;
      if (maxPR > minPR) {
        scale = 0.6 + ((planet.radiusEarth || 1) - minPR) / (maxPR - minPR) * 0.8; // Scale from 0.6 to 1.4
      }

      let spacing = 0; // Margin left
      if (index > 0) {
        const prev = sorted[index - 1];
        const prevVal = prev.semiMajorAxisAU || prev.orbitalPeriodDays || 0;
        const curVal = planet.semiMajorAxisAU || planet.orbitalPeriodDays || 0;
        const diff = curVal - prevVal;
        
        spacing = Math.max(80, diff * 1000); 
        spacing = Math.min(spacing, 350); // Cap spacing
      }

      return {
        planet,
        scale,
        spacing
      };
    });
  });
}

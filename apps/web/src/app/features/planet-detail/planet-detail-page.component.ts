import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, shareReplay } from 'rxjs';
import { ExoplanetApiService } from '../../core/services/exoplanet-api.service';
import { PlanetAvatarComponent, StatBadgeComponent, StatRowComponent, SystemOrbitPreviewComponent, AtmosphereSpectrumComponent, SizeComparisonComponent } from '@exodex/ui-components';
import { ATMOSPHERE_DATABASE } from '@exodex/shared-types';
import { renderStar } from '@exodex/planet-renderer';
import { getTelescopeWikiLink } from '../../core/constants/telescopes';

@Component({
  selector: 'app-planet-detail-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, PlanetAvatarComponent, StatBadgeComponent, StatRowComponent, SystemOrbitPreviewComponent, AtmosphereSpectrumComponent, SizeComparisonComponent, RouterLink],
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

        <div class="bento-grid">

          <!-- Hero tile -->
          <div class="bento-tile tile--hero">
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
              @if (p.controversialFlag) {
                <app-stat-badge type="controversial" value="disputed" />
              }
              @if (p.visualMagnitude !== null && p.visualMagnitude !== undefined && p.visualMagnitude < 6.5) {
                <app-stat-badge type="visibility" value="naked-eye" />
              }
            </div>
            <div class="discovery-year">{{ 'common.discoveredIn' | translate: { year: p.discoveryYear } }}</div>
          </div>

          <!-- Orbital -->
          <section class="bento-tile section--orbital">
            <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" stroke="#4d8aff" stroke-width="1.2"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/><circle cx="10" cy="10" r="1" fill="#4d8aff"/></svg></span> {{ 'sections.orbitalProperties' | translate }}</h3>
            @if (systemPlanets().length > 0) {
              <app-system-orbit-preview
                [planets]="systemPlanets()"
                [currentPlanetId]="p.id"
                [systemName]="p.hostStar" />
              <a [routerLink]="['/system', p.hostStar]" class="full-system-btn">
                <div class="system-btn-bg"></div>
                <div class="system-btn-content">
                  <div class="system-btn-left">
                    <svg class="system-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.4"/>
                      <ellipse cx="12" cy="12" rx="9" ry="4"/>
                      <ellipse cx="12" cy="12" rx="5" ry="9" transform="rotate(60 12 12)"/>
                    </svg>
                    <div class="system-btn-text">
                      <span class="system-btn-title">{{ 'planetDetail.exploreSystem' | translate:{ system: p.hostStar } }}</span>
                      <span class="system-btn-sub">{{ 'planetDetail.planetsDiscovered' | translate:{ count: systemPlanets().length } }}</span>
                    </div>
                  </div>
                  <svg class="system-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </a>
            }
            <app-stat-row [label]="'stats.orbitalPeriod' | translate" [value]="p.orbitalPeriodDays" [unit]="'units.days' | translate" [errPlus]="p.orbitalPeriodErr1" [errMinus]="p.orbitalPeriodErr2" />
            <app-stat-row [label]="'stats.semiMajorAxis' | translate" [value]="p.semiMajorAxisAU" [unit]="'units.au' | translate" />
            <app-stat-row [label]="'stats.eccentricity' | translate" [value]="p.eccentricity" />
            <app-stat-row [label]="'stats.inclination' | translate" [value]="p.inclinationDeg" [unit]="'units.deg' | translate" />
          </section>

          <!-- Physical -->
          <section class="bento-tile section--physical">
            <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" stroke="#a855f7" stroke-width="1.2"><circle cx="10" cy="10" r="8"/><path d="M10 2v16M2 10h16" opacity="0.3"/><circle cx="10" cy="10" r="4" fill="rgba(168,85,247,0.2)"/></svg></span> {{ 'sections.physicalProperties' | translate }}</h3>
            <app-stat-row [label]="'stats.radius' | translate" [value]="p.radiusEarth" [unit]="'units.radiusEarth' | translate" [errPlus]="p.radiusEarthErr1" [errMinus]="p.radiusEarthErr2" />
            <app-stat-row [label]="'stats.mass' | translate" [value]="p.massEarth" [unit]="'units.massEarth' | translate" [errPlus]="p.massEarthErr1" [errMinus]="p.massEarthErr2" />
            <app-stat-row [label]="'stats.density' | translate" [value]="p.densityGCC" [unit]="'units.density' | translate" />
            <app-stat-row [label]="'stats.gravity' | translate" [value]="p.gravityMS2" [unit]="'units.gravity' | translate" />
            <app-stat-row [label]="'stats.temperature' | translate" [value]="p.equilibriumTempK" [unit]="'units.tempK' | translate" [errPlus]="p.equilibriumTempErr1" [errMinus]="p.equilibriumTempErr2" />
            <app-stat-row [label]="'stats.distance' | translate" [value]="p.distanceParsec" [unit]="'units.pc' | translate" />
          </section>

          <!-- Host Star -->
          <section class="bento-tile section--star">
            <h3>
              <div class="section-title-wrap">
                <span class="section-icon"><svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="4" fill="#f59e0b" opacity="0.8"/><path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.3 4.3l2.1 2.1M13.6 13.6l2.1 2.1M4.3 15.7l2.1-2.1M13.6 6.4l2.1-2.1" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round"/></svg></span>
                {{ 'sections.hostStar' | translate }}
              </div>
              <div class="host-star-badges" *ngIf="p.hostStar">
                <span class="star-name-badge">{{ p.hostStar }}</span>
                @if (p.spectralType) {
                  <span class="star-type-badge spectral-real"
                        [style.color]="starData()?.primaryColor"
                        [style.borderColor]="starData()?.primaryColor"
                        [style.backgroundColor]="starData()?.primaryColor + '15'">
                    {{ p.spectralType }}
                  </span>
                } @else if (starData()?.spectralClass) {
                  <span class="star-type-badge"
                        [style.color]="starData()?.primaryColor"
                        [style.borderColor]="starData()?.primaryColor"
                        [style.backgroundColor]="starData()?.primaryColor + '15'">
                    {{ 'systemDetail.type' | translate }} {{ starData()?.spectralClass }}
                  </span>
                }
                @if (p.visualMagnitude !== null && p.visualMagnitude !== undefined && p.visualMagnitude < 6.5) {
                  <span class="naked-eye-indicator">
                    <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                      <path d="M8 3.5C4.7 3.5 2 6.3 1.3 8c.7 1.7 3.4 4.5 6.7 4.5s6-2.8 6.7-4.5c-.7-1.7-3.4-4.5-6.7-4.5z" stroke="#22d3ee" stroke-width="1" fill="rgba(34,211,238,0.1)"/>
                      <circle cx="8" cy="8" r="2" fill="#22d3ee" opacity="0.7"/>
                    </svg>
                    {{ p.visualMagnitude | number:'1.1-1' }}m
                  </span>
                }
              </div>
            </h3>
            @if (starData()?.svg) {
              <div class="host-star-avatar-container">
                <div class="host-star-avatar" [innerHTML]="starData()?.svg"></div>
              </div>
            }
            <app-stat-row [label]="'stats.spectralType' | translate" [value]="p.spectralType" />
            <app-stat-row [label]="'stats.stellarTemperature' | translate" [value]="p.stellarTempK" [unit]="'units.tempK' | translate" />
            <app-stat-row [label]="'stats.stellarRadius' | translate" [value]="p.stellarRadiusSun" [unit]="'units.radiusSun' | translate" />
            <app-stat-row [label]="'stats.stellarMass' | translate" [value]="p.stellarMassSun" [unit]="'units.massSun' | translate" />
            <app-stat-row [label]="'stats.stellarMetallicity' | translate" [value]="p.stellarMetallicity" />
            <app-stat-row [label]="'stats.stellarGravity' | translate" [value]="p.stellarSurfaceGravity" [unit]="'units.logg' | translate" />
            <app-stat-row [label]="'stats.stellarAge' | translate" [value]="p.stellarAge" [unit]="'units.gyr' | translate" />
            <app-stat-row [label]="'stats.visualMagnitude' | translate" [value]="p.visualMagnitude" />
          </section>

          <!-- Discovery (col 1, row 3) -->
          <section class="bento-tile section--discovery">
            <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" stroke="#22d3ee" stroke-width="1.2" stroke-linecap="round"><path d="M14 3l3 5-10 6-3-5z" fill="rgba(34,211,238,0.15)"/><path d="M7 14l-3 4"/><path d="M4 18h6"/><circle cx="16" cy="4" r="1.5" fill="rgba(34,211,238,0.3)"/></svg></span> {{ 'sections.discovery' | translate }}</h3>
            <app-stat-row [label]="'stats.discoveryMethod' | translate" [value]="p.discoveryMethod ? ('stats.methodNames.' + p.discoveryMethod | translate) : '—'" [href]="getDiscoveryMethodLink(p.discoveryMethod)" [isExternalLink]="false" />
            <app-stat-row [label]="'stats.discoveryYear' | translate" [value]="p.discoveryYear" />
            <app-stat-row [label]="'stats.discoveryFacility' | translate" [value]="p.discoveryFacility" />
            <app-stat-row [label]="'stats.telescope' | translate" [value]="p.telescope" [href]="getTelescopeWikiLink(p.telescope)" [isExternalLink]="true" />
          </section>

          <!-- Atmosphere (col 2, row 3) — always rendered -->
          <section class="bento-tile atmosphere-section section--atmosphere">
            <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="spec-icon" x1="0" y1="0" x2="20" y2="20"><stop offset="0%" stop-color="#ef4444"/><stop offset="25%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#22c55e"/><stop offset="75%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><rect x="2" y="7" width="16" height="6" rx="1" fill="url(#spec-icon)" opacity="0.6"/><line x1="6" y1="5" x2="6" y2="15" stroke="#e8eeff" stroke-width="1" opacity="0.7"/><line x1="10" y1="4" x2="10" y2="16" stroke="#e8eeff" stroke-width="1" opacity="0.5"/><line x1="14" y1="5" x2="14" y2="15" stroke="#e8eeff" stroke-width="1" opacity="0.7"/></svg></span> {{ 'didactic.atmosphereTitle' | translate }}</h3>
            @if (atmosphereData(); as atm) {
              <p class="atmosphere-desc">{{ 'didactic.atmosphereDesc' | translate }}</p>
              <app-atmosphere-spectrum [data]="atm" />
            } @else {
              <p class="no-data-msg">{{ 'didactic.noAtmosphereData' | translate }}</p>
            }
          </section>

          <!-- Size comparison (col 1, row 4) — always rendered -->
          <section class="bento-tile section--size">
            <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="10" r="6" fill="rgba(77,138,255,0.2)" stroke="#4d8aff" stroke-width="0.8"/><circle cx="6" cy="12" r="3" fill="rgba(34,197,94,0.3)" stroke="#22c55e" stroke-width="0.8"/></svg></span> {{ 'didactic.sizeComparisonTitle' | translate }}</h3>
            @if (p.radiusEarth) {
              <app-size-comparison [planet]="p" />
            } @else {
              <p class="no-data-msg">{{ 'didactic.noSizeData' | translate }}</p>
            }
          </section>

          <!-- Metadata (col 2, row 4) — always rendered -->
          <section class="bento-tile section--metadata metadata-section">
            <h3><span class="section-icon"><svg viewBox="0 0 20 20" fill="none" stroke="#8892b0" stroke-width="1.2" stroke-linecap="round"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 9h14"/><path d="M7 4V2M13 4V2"/></svg></span> {{ 'sections.metadata' | translate }}</h3>
            <app-stat-row [label]="'stats.publicationDate' | translate" [value]="p.publicationDate" />
            <app-stat-row [label]="'stats.lastUpdated' | translate" [value]="p.lastUpdated" />
          </section>

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

    .bento-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: start;
    }

    /* Bento placements — explicit 2-col layout, row order follows DOM order */
    .tile--hero         { grid-column: 1; }
    .section--orbital   { grid-column: 2; }
    .section--physical  { grid-column: 1; }
    .section--star      { grid-column: 2; }
    .section--discovery { grid-column: 1; }
    .section--atmosphere{ grid-column: 2; }
    .section--size      { grid-column: 1; }
    .section--metadata  { grid-column: 2; }

    /* Hero planet with orbital rings */
    .tile--hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      justify-content: center;
    }

    .planet-hero {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      max-width: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
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
      font-size: 1.4rem;
      font-weight: 900;
      letter-spacing: 2px;
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
      flex-wrap: wrap;
      justify-content: center;
    }

    .discovery-year {
      font-size: 13px;
      color: #4a5568;
      font-family: 'Inter', sans-serif;
    }

    .bento-tile {
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
      transition: border-color 300ms ease, box-shadow 300ms ease;
    }

    .bento-tile:hover {
      border-color: rgba(77, 138, 255, 0.12);
      box-shadow: 0 0 20px rgba(77, 138, 255, 0.05);
    }

    .bento-tile h3 {
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

    .atmosphere-desc {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #5a6177;
      margin-bottom: 14px;
      line-height: 1.6;
    }

    .no-data-msg {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #4a5568;
      font-style: italic;
      padding: 20px 0;
      text-align: center;
    }

    .naked-eye-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      color: #22d3ee;
      background: rgba(34, 211, 238, 0.08);
      border: 1px solid rgba(34, 211, 238, 0.15);
      padding: 2px 8px;
      border-radius: 6px;
      text-transform: none;
      letter-spacing: 0;
    }

    .spectral-real {
      font-family: 'JetBrains Mono', monospace !important;
    }

    .metadata-section {
      opacity: 0.8;
    }

    .metadata-section h3 {
      color: #8892b0 !important;
      border-bottom-color: rgba(136, 146, 176, 0.1) !important;
    }

    .full-system-btn {
      display: block;
      position: relative;
      overflow: hidden;
      width: 100%;
      margin-top: -8px;
      margin-bottom: 24px;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(77, 138, 255, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%);
      border: 1px solid rgba(77, 138, 255, 0.2);
      border-radius: 14px;
      text-decoration: none;
      transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .system-btn-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(77, 138, 255, 0.15) 0%, rgba(168, 85, 247, 0.12) 100%);
      opacity: 0;
      transition: opacity 400ms ease;
    }

    .full-system-btn:hover .system-btn-bg {
      opacity: 1;
    }

    .full-system-btn:hover {
      border-color: rgba(77, 138, 255, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(77, 138, 255, 0.15), 0 0 0 1px rgba(77, 138, 255, 0.1);
    }

    .system-btn-content {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1;
    }

    .system-btn-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .system-btn-icon {
      width: 32px;
      height: 32px;
      color: #6da5ff;
      flex-shrink: 0;
      filter: drop-shadow(0 0 6px rgba(109, 165, 255, 0.4));
      transition: transform 400ms ease;
    }

    .full-system-btn:hover .system-btn-icon {
      transform: rotate(30deg) scale(1.1);
    }

    .system-btn-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .system-btn-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #e8eeff;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .system-btn-sub {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #8892b0;
      letter-spacing: 0;
      text-transform: none;
    }

    .system-btn-arrow {
      color: #6da5ff;
      opacity: 0.5;
      transform: translateX(-4px);
      transition: all 300ms ease;
    }

    .full-system-btn:hover .system-btn-arrow {
      opacity: 1;
      transform: translateX(2px);
    }

    @media (max-width: 768px) {
      .bento-grid {
        grid-template-columns: 1fr;
      }
      .tile--hero,
      .section--orbital,
      .section--physical,
      .section--star,
      .section--discovery,
      .section--atmosphere,
      .section--size,
      .section--metadata {
        grid-column: 1;
      }

      .planet-detail {
        padding: 16px;
      }

      .back-btn {
        margin-bottom: 20px;
      }

      .bento-tile {
        padding: 18px;
      }

      .full-system-btn {
        padding: 12px 16px;
      }

      .system-btn-title {
        font-size: 11px;
      }

      .system-btn-icon {
        width: 26px;
        height: 26px;
      }
    }

    @media (max-width: 480px) {
      .planet-detail {
        padding: 12px;
      }

      .planet-hero {
        width: 180px;
        height: 180px;
        margin-bottom: 20px;
      }

      .planet-name {
        font-size: 1.2rem;
        letter-spacing: 2px;
      }

      .planet-meta {
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .bento-tile {
        padding: 14px;
        border-radius: 12px;
      }

      .bento-tile h3 {
        font-size: 10px;
        flex-wrap: wrap;
      }

      .host-star-avatar {
        width: 100px;
        height: 100px;
      }

      .host-star-badges {
        flex-wrap: wrap;
        gap: 4px;
      }

      .back-btn {
        padding: 8px 14px;
        font-size: 13px;
        margin-bottom: 16px;
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

  atmosphereData = computed(() => {
    const p = this.planet();
    if (!p) return null;
    return ATMOSPHERE_DATABASE[p.id] || null;
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

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
        {{ 'systemDetail.returnToExodex' | translate }}
      </button>

      @if (planets() && planets().length > 0) {
        <div class="system-header">
          <div class="header-content">
            <h1 class="system-name">
              <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.4"/>
                <ellipse cx="12" cy="12" rx="9" ry="4"/>
                <ellipse cx="12" cy="12" rx="5" ry="9" transform="rotate(60 12 12)"/>
              </svg>
              {{ systemName() }} {{ 'systemDetail.system' | translate }}
            </h1>
            <p class="system-subtitle">
              <span class="planet-count-badge">{{ planets().length }}</span>
              {{ (planets().length === 1 ? 'systemDetail.planetsDiscoveredSingle' : 'systemDetail.planetsDiscoveredPlural') | translate : { count: planets().length } }}
            </p>
          </div>
        </div>

        <div class="system-visualizer-wrapper">
          <!-- Ambient particles -->
          <div class="ambient-particle p1"></div>
          <div class="ambient-particle p2"></div>
          <div class="ambient-particle p3"></div>
          <div class="ambient-particle p4"></div>
          <div class="ambient-particle p5"></div>

          <div class="system-visualizer">

            <!-- Host Star -->
            <div class="star-section">
              <div class="star-avatar-container">
                <div class="star-avatar" [innerHTML]="starData()?.svg"></div>
              </div>
              <div class="star-info">
                <h3 class="star-title">{{ systemName() }}</h3>
                <span class="spectral-badge"
                      [style.color]="starData()?.primaryColor"
                      [style.borderColor]="starData()?.primaryColor"
                      [style.backgroundColor]="starData()?.primaryColor + '12'">
                  <span class="spectral-dot" [style.background]="starData()?.primaryColor"></span>
                  {{ 'systemDetail.type' | translate }} {{ starData()?.spectralClass }}
                </span>
                <div class="star-stats-grid">
                  <div class="star-stat-item">
                    <span class="stat-label">{{ 'systemDetail.temp' | translate }}</span>
                    <span class="stat-val">{{ planets()[0].stellarTempK || '—' }} <small>K</small></span>
                  </div>
                  <div class="star-stat-item">
                    <span class="stat-label">{{ 'systemDetail.mass' | translate }}</span>
                    <span class="stat-val">{{ planets()[0].stellarMassSun || '—' }} <small>M☉</small></span>
                  </div>
                  <div class="star-stat-item">
                    <span class="stat-label">{{ 'systemDetail.radius' | translate }}</span>
                    <span class="stat-val">{{ planets()[0].stellarRadiusSun || '—' }} <small>R☉</small></span>
                  </div>
                  <div class="star-stat-item">
                    <span class="stat-label">{{ 'systemDetail.age' | translate }}</span>
                    <span class="stat-val">{{ planets()[0].stellarAge || '—' }} <small>Gyr</small></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Orbit Track Line -->
            <div class="orbit-timeline">
              <div class="orbit-pulse"></div>
            </div>

            <!-- Planets -->
            <div class="planets-section">
              <div class="spacer" style="width: 100px;"></div>
              @for (planet of mappedPlanets(); track planet.planet.id; let i = $index) {
                <a class="planet-node" [routerLink]="['/planeta', planet.planet.id]" [style.margin-left.px]="planet.spacing" [style.animation-delay]="(i * 120) + 'ms'">
                  <!-- Orbit vertical connector dot -->
                  <div class="orbit-connector">
                    <div class="connector-dot" [style.background]="planet.color" [style.box-shadow]="'0 0 8px ' + planet.color + '80'"></div>
                  </div>

                  <div class="planet-avatar-wrapper" [style.transform]="'scale(' + planet.scale + ')'">
                    <div class="planet-glow" [style.background]="'radial-gradient(circle, ' + planet.color + '20 0%, transparent 70%)'"></div>
                    <app-planet-avatar [planet]="planet.planet" size="card" />
                  </div>

                  <div class="planet-info-card">
                    <div class="card-accent-line" [style.background]="'linear-gradient(90deg, ' + planet.color + ', transparent)'"></div>
                    <h4>{{ planet.planet.name }}</h4>
                    <div class="planet-type-tag" [style.color]="planet.color" [style.borderColor]="planet.color + '40'" [style.background]="planet.color + '10'">
                      {{ planet.planet.planetType.replace('-', ' ') }}
                    </div>

                    <div class="mini-stats">
                      <div class="mini-stat">
                        <span class="mini-icon">◷</span>
                        <span class="mini-val">{{ planet.planet.orbitalPeriodDays | number:'1.0-1' }}</span>
                        <span class="mini-unit">{{ 'stats.days' | translate }}</span>
                      </div>
                      <div class="mini-stat">
                        <span class="mini-icon">⟷</span>
                        <span class="mini-val">{{ planet.planet.semiMajorAxisAU | number:'1.0-3' }}</span>
                        <span class="mini-unit">AU</span>
                      </div>
                      <div class="mini-stat">
                        <span class="mini-icon">◎</span>
                        <span class="mini-val">{{ planet.planet.radiusEarth | number:'1.0-2' }}</span>
                        <span class="mini-unit">R⊕</span>
                      </div>
                      <div class="mini-stat">
                        <span class="mini-icon">🌡</span>
                        <span class="mini-val">{{ planet.planet.equilibriumTempK || '—' }}</span>
                        <span class="mini-unit">K</span>
                      </div>
                    </div>

                    <div class="card-footer">
                      <span class="hab-indicator" [class]="'hab-' + planet.planet.habitabilityClass">
                        {{ planet.planet.habitabilityClass.replace('-', ' ') }}
                      </span>
                      <span class="view-link">
                        {{ 'systemDetail.view' | translate }}
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
                          <path d="M6 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              }
              <div class="spacer" style="width: 200px;"></div>
            </div>

          </div>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" width="48" height="48" opacity="0.6">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
          </svg>
          <h2>{{ 'systemDetail.notFound' | translate }}</h2>
          <p>{{ 'systemDetail.notFoundDesc' | translate }}</p>
          <button class="back-btn" routerLink="/">{{ 'systemDetail.returnToExodex' | translate }}</button>
        </div>
      } @else {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'systemDetail.scanning' | translate:{ system: systemName() } }}</p>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    @keyframes planetNodeEnter {
      from { opacity: 0; transform: translateY(30px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes pulseOrbit {
      0% { transform: translateX(-100%); opacity: 0; }
      10% { opacity: 1; }
      100% { transform: translateX(100vw); opacity: 0; }
    }

    @keyframes floatAmbient {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
      50% { transform: translateY(-15px) scale(1.2); opacity: 0.6; }
    }

    @keyframes starBreath {
      0%, 100% { opacity: 0.15; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.05); }
    }

    .system-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      animation: fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 24px 32px 16px;
      width: fit-content;
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
      flex-shrink: 0;
    }
    .back-btn:hover {
      background: rgba(77, 138, 255, 0.1);
      color: #e8eeff;
      border-color: rgba(77, 138, 255, 0.3);
      transform: translateX(-4px);
    }

    /* ═══════ HEADER ═══════ */
    .system-header { 
      padding: 0 32px 24px;
      flex-shrink: 0;
    }

    .system-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 2.4rem;
      font-weight: 900;
      color: #e8eeff;
      margin: 0 0 10px 0;
      letter-spacing: 1.5px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header-icon {
      width: 34px;
      height: 34px;
      color: #6da5ff;
      filter: drop-shadow(0 0 10px rgba(109, 165, 255, 0.5));
      animation: starBreath 4s ease-in-out infinite;
    }

    .system-subtitle {
      color: #6a7394;
      font-size: 15px;
      font-family: 'Inter', sans-serif;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .planet-count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      background: rgba(77, 138, 255, 0.15);
      border-radius: 8px;
      color: #4d8aff;
      font-weight: 700;
      font-size: 13px;
      font-family: 'Orbitron', sans-serif;
      border: 1px solid rgba(77, 138, 255, 0.2);
    }

    /* ═══════ VISUALIZER WRAPPER ═══════ */
    .system-visualizer-wrapper {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      scrollbar-width: thin;
      scrollbar-color: rgba(77, 138, 255, 0.3) rgba(10, 14, 28, 0.3);
      background: 
        radial-gradient(ellipse at 3% 50%, rgba(15, 20, 40, 0.7) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 50%, rgba(10, 14, 28, 0.15) 0%, transparent 70%);
      border-top: 1px solid rgba(255, 255, 255, 0.03);
      position: relative;
    }
    .system-visualizer-wrapper::-webkit-scrollbar { height: 6px; }
    .system-visualizer-wrapper::-webkit-scrollbar-track {
      background: rgba(10, 14, 28, 0.2);
      border-radius: 3px;
      margin: 0 24px;
    }
    .system-visualizer-wrapper::-webkit-scrollbar-thumb {
      background: rgba(77, 138, 255, 0.25);
      border-radius: 3px;
    }
    .system-visualizer-wrapper::-webkit-scrollbar-thumb:hover {
      background: rgba(77, 138, 255, 0.4);
    }

    /* Ambient floating particles */
    .ambient-particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(77, 138, 255, 0.4);
      border-radius: 50%;
      pointer-events: none;
      animation: floatAmbient 6s ease-in-out infinite;
    }
    .p1 { top: 15%; left: 30%; animation-delay: 0s; animation-duration: 7s; }
    .p2 { top: 70%; left: 50%; animation-delay: 1.5s; animation-duration: 5s; width: 2px; height: 2px; }
    .p3 { top: 25%; left: 70%; animation-delay: 3s; animation-duration: 8s; background: rgba(168, 85, 247, 0.3); }
    .p4 { top: 80%; left: 20%; animation-delay: 2s; animation-duration: 6s; width: 2px; height: 2px; background: rgba(34, 211, 238, 0.3); }
    .p5 { top: 40%; left: 85%; animation-delay: 4s; animation-duration: 9s; }

    .system-visualizer {
      display: flex;
      align-items: center;
      height: 100%;
      min-width: min-content;
      position: relative;
    }

    /* ═══════ ORBIT TIMELINE ═══════ */
    .orbit-timeline {
      position: absolute;
      top: 34%;
      left: 300px;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg,
        rgba(77, 138, 255, 0.3) 0%,
        rgba(255, 255, 255, 0.14) 15%,
        rgba(255, 255, 255, 0.07) 50%,
        rgba(255, 255, 255, 0.02) 100%
      );
      z-index: 0;
      overflow: hidden;
    }
    .orbit-pulse {
      position: absolute;
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, transparent, rgba(77, 138, 255, 0.6), transparent);
      border-radius: 2px;
      animation: pulseOrbit 8s linear infinite;
    }

    /* ═══════ STAR SECTION ═══════ */
    .star-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 20px;
      width: 400px;
      height: 100%;
      flex-shrink: 0;
      z-index: 10;
      position: relative;
      margin-left: -80px; /* Offset to partially hide star off left edge */
    }



    .star-avatar-container {
      width: 550px;
      margin-top: -200px;
      height: 550px;
      border-radius: 50%;
      margin-left: -150px; /* Match offset */
      position: relative;
      transition: box-shadow 500ms ease;
    }
    .star-avatar {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    /* Fixed pseudo-class from :deep to ::ng-deep for Angular */
    .star-avatar ::ng-deep svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .star-info {
      position: absolute;
      bottom: 24px;
      left: 120px;
      z-index: 15;
      text-align: left;
      width: 260px;
    }
    .star-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.3rem;
      font-weight: 800;
      color: #e8eeff;
      margin: 0 0 10px 0;
      letter-spacing: 1px;
    }

    .spectral-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      font-size: 10px;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: 1px solid;
      border-radius: 8px;
      margin-bottom: 18px;
    }
    .spectral-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .star-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: rgba(10, 14, 28, 0.7);
      backdrop-filter: blur(12px);
      padding: 14px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      width: 210px;
    }
    .star-stat-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stat-label {
      font-size: 9px;
      color: #4a5568;
      font-family: 'Inter', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-val {
      font-size: 13px;
      color: #c9d1e5;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
    .stat-val small {
      font-size: 9px;
      color: #4a5568;
      font-weight: 400;
    }

    /* ═══════ PLANETS ═══════ */
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
      cursor: pointer;
      animation: planetNodeEnter 600ms cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    .planet-node:hover {
      z-index: 20;
    }

    /* Orbit connector */
    .orbit-connector {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1px;
      height: 100%;
      z-index: -1;
    }
    .connector-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      transition: all 300ms ease;
    }
    .planet-node:hover .connector-dot {
      width: 10px;
      height: 10px;
    }

    .planet-avatar-wrapper {
      width: 110px;
      height: 110px;
      margin-bottom: 16px;
      filter: drop-shadow(0 0 18px rgba(0,0,0,0.5));
      transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center center;
      position: relative;
    }
    .planet-glow {
      position: absolute;
      inset: -20px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 400ms ease;
    }
    .planet-node:hover .planet-glow {
      opacity: 1;
    }

    .planet-node:hover .planet-avatar-wrapper {
      filter: drop-shadow(0 0 30px rgba(77, 138, 255, 0.6));
      transform: scale(1.08) translateY(-8px) !important;
    }

    /* ═══════ PLANET CARD ═══════ */
    .planet-info-card {
      background: rgba(12, 16, 35, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 18px;
      width: 200px;
      text-align: left;
      transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: hidden;
    }

    .card-accent-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      opacity: 0;
      transition: opacity 300ms ease;
    }
    .planet-node:hover .card-accent-line {
      opacity: 1;
    }

    .planet-node:hover .planet-info-card {
      border-color: rgba(77, 138, 255, 0.25);
      background: rgba(16, 21, 45, 0.95);
      box-shadow:
        0 16px 48px rgba(0, 0, 0, 0.4),
        0 0 40px rgba(77, 138, 255, 0.08);
      transform: translateY(-4px);
    }

    .planet-info-card h4 {
      font-family: 'Orbitron', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #e8eeff;
      margin: 0 0 8px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.5px;
    }

    .planet-type-tag {
      display: inline-block;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      padding: 3px 8px;
      border: 1px solid;
      border-radius: 6px;
      margin-bottom: 14px;
    }

    .mini-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }
    .mini-stat {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .mini-icon {
      font-size: 10px;
      color: #4a5568;
      width: 14px;
      flex-shrink: 0;
    }
    .mini-val {
      font-size: 12px;
      color: #c9d1e5;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
    }
    .mini-unit {
      font-size: 9px;
      color: #4a5568;
      font-family: 'Inter', sans-serif;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }

    .hab-indicator {
      font-size: 9px;
      font-weight: 600;
      text-transform: capitalize;
      padding: 3px 8px;
      border-radius: 6px;
      font-family: 'Inter', sans-serif;
    }
    .hab-potentially-habitable {
      background: rgba(34, 197, 94, 0.1);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.15);
    }
    .hab-marginal {
      background: rgba(234, 179, 8, 0.1);
      color: #facc15;
      border: 1px solid rgba(234, 179, 8, 0.15);
    }
    .hab-uninhabitable {
      background: rgba(239, 68, 68, 0.08);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.1);
    }
    .hab-unknown {
      background: rgba(148, 163, 184, 0.08);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .view-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #4d8aff;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      opacity: 0;
      transform: translateX(-6px);
      transition: all 300ms ease;
    }
    .planet-node:hover .view-link {
      opacity: 1;
      transform: translateX(0);
    }

    /* ═══════ STATES ═══════ */
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      text-align: center;
      gap: 4px;
    }
    .loading-state p { color: #8892b0; font-family: 'Inter', sans-serif; margin-top: 16px; }
    .error-state h2 { color: #ef4444; font-family: 'Orbitron', sans-serif; margin: 12px 0 4px; font-size: 1.2rem; }
    .error-state p { color: #8892b0; font-family: 'Inter', sans-serif; margin: 0 0 24px; }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(77, 138, 255, 0.1);
      border-top-color: #4d8aff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* ═══════ RESPONSIVE ═══════ */
    @media (max-width: 768px) {
      .system-container { padding: 0; }
      .system-header { padding: 0 16px 16px; }
      .back-btn { margin: 16px 16px 12px; }
      .system-name { font-size: 1.4rem; gap: 10px; }
      .header-icon { width: 24px; height: 24px; }
      .star-avatar-container { width: 300px; height: 300px; margin-left: -100px; margin-top: -130px; }
      .star-section { width: 260px; margin-left: -60px; }
      .star-info { left: 80px; width: 200px; }
      .star-title { font-size: 1rem; }
      .star-stats-grid { width: 180px; padding: 10px; gap: 6px; }
      .planet-info-card { width: 160px; padding: 12px; }
      .planet-avatar-wrapper { width: 80px; height: 80px; margin-bottom: 12px; }
      .mini-stats { grid-template-columns: 1fr; gap: 4px; }
      .mini-val { font-size: 11px; }
      .system-visualizer-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }

    @media (max-width: 480px) {
      .system-name { font-size: 1.1rem; }
      .system-subtitle { font-size: 13px; }
      .star-avatar-container { width: 220px; height: 220px; margin-left: -80px; margin-top: -80px; }
      .star-section { width: 200px; margin-left: -40px; }
      .star-info { left: 50px; bottom: 16px; width: 160px; }
      .star-title { font-size: 0.85rem; }
      .spectral-badge { font-size: 8px; padding: 3px 8px; margin-bottom: 10px; }
      .star-stats-grid { width: 160px; padding: 8px; font-size: 8px; }
      .stat-val { font-size: 11px; }
      .planet-info-card { width: 140px; padding: 10px; }
      .planet-info-card h4 { font-size: 11px; }
      .planet-type-tag { font-size: 8px; padding: 2px 6px; margin-bottom: 10px; }
      .planet-avatar-wrapper { width: 65px; height: 65px; margin-bottom: 10px; }
      .card-footer { margin-top: 10px; padding-top: 8px; }
      .orbit-timeline { left: 200px; }
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
      numberOfStarsInSystem: 1
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
        scale = 0.6 + ((planet.radiusEarth || 1) - minPR) / (maxPR - minPR) * 0.8;
      }

      let spacing = 0;
      if (index > 0) {
        const prev = sorted[index - 1];
        const prevVal = prev.semiMajorAxisAU || prev.orbitalPeriodDays || 0;
        const curVal = planet.semiMajorAxisAU || planet.orbitalPeriodDays || 0;
        const diff = curVal - prevVal;

        spacing = Math.max(80, diff * 1000);
        spacing = Math.min(spacing, 350);
      }

      // Color based on temperature
      let color = '#a0aec0';
      if (planet.equilibriumTempK) {
        if (planet.equilibriumTempK > 1500) color = '#ef4444';
        else if (planet.equilibriumTempK > 800) color = '#f97316';
        else if (planet.equilibriumTempK > 400) color = '#eab308';
        else if (planet.equilibriumTempK > 200) color = '#22c55e';
        else color = '#38bdf8';
      }

      return { planet, scale, spacing, color };
    });
  });
}

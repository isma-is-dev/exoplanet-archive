import { Component, input, computed, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Exoplanet } from '@exodex/shared-types';
import { renderPlanet } from '@exodex/planet-renderer';

@Component({
  selector: 'app-size-comparison',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-comparison">
      <div class="comparison-bodies">
        <!-- Earth -->
        <div class="body-column">
          <div class="body-avatar" [style.width.px]="sizes().earthPx" [style.height.px]="sizes().earthPx">
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <radialGradient id="sc-earth-rg" cx="38%" cy="38%">
                  <stop offset="0%" stop-color="rgba(150,220,255,0.5)" />
                  <stop offset="35%" stop-color="#3b82f6" />
                  <stop offset="100%" stop-color="#1a3a6a" />
                </radialGradient>
              </defs>
              <circle cx="60" cy="60" r="56" fill="url(#sc-earth-rg)"/>
              <ellipse cx="48" cy="42" rx="12" ry="16" fill="rgba(34,197,94,0.35)" transform="rotate(-10 48 42)"/>
              <ellipse cx="72" cy="50" rx="8" ry="10" fill="rgba(34,197,94,0.25)" transform="rotate(15 72 50)" />
              <ellipse cx="55" cy="72" rx="14" ry="8" fill="rgba(34,197,94,0.3)" transform="rotate(-5 55 72)"/>
              <ellipse cx="38" cy="58" rx="5" ry="4" fill="rgba(34,197,94,0.2)"/>
              <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(100,180,255,0.2)" stroke-width="2"/>
              <ellipse cx="45" cy="38" rx="14" ry="10" fill="rgba(255,255,255,0.08)" transform="rotate(-20 45 38)"/>
            </svg>
          </div>
          <span class="body-name">{{ 'didactic.earth' | translate }}</span>
          <span class="body-radius">1.00 R⊕</span>
        </div>

        <!-- Scale indicator -->
        <div class="scale-connector">
          <div class="connector-line"></div>
          <span class="scale-factor">{{ ratioText() }}×</span>
          <div class="connector-line"></div>
        </div>

        <!-- Planet (rendered via same procedural renderer) -->
        <div class="body-column">
          <div class="body-avatar" [style.width.px]="sizes().planetPx" [style.height.px]="sizes().planetPx"
               [innerHTML]="planetSvg()">
          </div>
          <span class="body-name planet-name-label">{{ planet().name }}</span>
          <span class="body-radius">{{ planet().radiusEarth | number:'1.0-2' }} R⊕</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .size-comparison {
      padding: 8px 0;
    }

    .comparison-bodies {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      min-height: 150px;
    }

    .body-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .body-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .body-avatar svg,
    .body-avatar ::ng-deep svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .body-name {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #8892b0;
      text-align: center;
    }

    .planet-name-label {
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .body-radius {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #4a5568;
    }

    .scale-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 0 4px;
      flex-shrink: 0;
    }

    .connector-line {
      width: 1px;
      height: 20px;
      background: linear-gradient(180deg, transparent, rgba(77, 138, 255, 0.2), transparent);
    }

    .scale-factor {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: #4d8aff;
      background: rgba(77, 138, 255, 0.08);
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid rgba(77, 138, 255, 0.15);
      white-space: nowrap;
    }

    @media (max-width: 480px) {
      .comparison-bodies {
        gap: 12px;
        min-height: 110px;
      }

      .scale-factor {
        font-size: 12px;
        padding: 3px 8px;
      }
    }
  `,
})
export class SizeComparisonComponent implements OnInit {
  planet = input.required<Exoplanet>();

  private sanitizer = inject(DomSanitizer);

  planetSvg = signal<SafeHtml>('');

  ratioText = computed(() => {
    const r = this.planet()?.radiusEarth;
    if (!r) return '—';
    return r.toFixed(2);
  });

  /**
   * Both sizes are calculated proportionally.
   * The BIGGER body gets max size, the smaller one scales down proportionally.
   */
  sizes = computed(() => {
    const r = this.planet()?.radiusEarth || 1;
    const maxPx = 120;
    const minPx = 14;

    if (r >= 1) {
      // Planet is bigger → planet gets max, Earth shrinks
      const planetPx = maxPx;
      const earthPx = Math.max(minPx, Math.round(maxPx / r));
      return { earthPx, planetPx };
    } else {
      // Earth is bigger → Earth gets max, planet shrinks
      const earthPx = maxPx;
      const planetPx = Math.max(minPx, Math.round(maxPx * r));
      return { earthPx, planetPx };
    }
  });

  ngOnInit(): void {
    const p = this.planet();
    if (!p) return;

    const result = renderPlanet({
      radiusEarth: p.radiusEarth,
      massEarth: p.massEarth,
      equilibriumTempK: p.equilibriumTempK,
      planetType: p.planetType,
      densityGCC: p.densityGCC,
      eccentricity: p.eccentricity,
      insolationFlux: p.insolationFlux,
      discoveryYear: p.discoveryYear,
      orbitalPeriodDays: p.orbitalPeriodDays,
      size: 'card',
      animationsEnabled: false,
    }, p.name);

    this.planetSvg.set(this.sanitizer.bypassSecurityTrustHtml(result.svgString));
  }
}

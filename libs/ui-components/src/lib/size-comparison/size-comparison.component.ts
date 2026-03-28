import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Exoplanet } from '@exodex/shared-types';

const JUPITER_R = 11.2;
const MAX_PX = 140;
const MIN_PX = 10;

@Component({
  selector: 'app-size-comparison',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-comparison">
      <div class="comparison-stage">
        <!-- Earth -->
        <div class="body-column">
          <div class="body-spacer" [style.height.px]="MAX_PX - sizes().earthPx"></div>
          <div class="body-circle earth"
               [style.width.px]="sizes().earthPx"
               [style.height.px]="sizes().earthPx">
          </div>
          <span class="body-name">Earth</span>
          <span class="body-radius">1.00 R⊕</span>
        </div>

        <!-- Jupiter — only when planet radius > 3 R⊕ -->
        @if (sizes().showJupiter) {
          <div class="body-column">
            <div class="body-spacer" [style.height.px]="MAX_PX - sizes().jupiterPx"></div>
            <div class="body-circle jupiter"
                 [style.width.px]="sizes().jupiterPx"
                 [style.height.px]="sizes().jupiterPx">
            </div>
            <span class="body-name">Jupiter</span>
            <span class="body-radius">11.2 R⊕</span>
          </div>
        }

        <!-- Exoplanet -->
        <div class="body-column">
          <div class="body-spacer" [style.height.px]="MAX_PX - sizes().planetPx"></div>
          <div class="body-circle"
               [class]="'planet-type--' + planet().planetType"
               [style.width.px]="sizes().planetPx"
               [style.height.px]="sizes().planetPx">
          </div>
          <span class="body-name planet-name-label">{{ planet().name }}</span>
          <span class="body-radius">{{ planet().radiusEarth | number:'1.2-2' }} R⊕</span>
        </div>
      </div>

      <div class="baseline"></div>

      <div class="scale-note">
        {{ planet().radiusEarth | number:'1.2-2' }}× Earth radius
        @if (sizes().showJupiter) {
          · {{ (planet().radiusEarth! / JUPITER_R) | number:'1.2-2' }}× Jupiter radius
        }
      </div>
    </div>
  `,
  styles: `
    .size-comparison {
      padding: 8px 0 4px;
    }

    .comparison-stage {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 32px;
      padding-bottom: 0;
    }

    .body-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }

    .body-spacer {
      flex-shrink: 0;
    }

    .body-circle {
      border-radius: 50%;
      flex-shrink: 0;
      position: relative;
    }

    /* Earth */
    .earth {
      background: radial-gradient(circle at 38% 32%,
        rgba(180, 230, 255, 0.9) 0%,
        #3b82f6 35%,
        #1e40af 65%,
        #1a3a6a 100%
      );
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.35),
                  inset -3px -3px 8px rgba(0,0,0,0.3);
    }

    /* Jupiter */
    .jupiter {
      background: radial-gradient(circle at 38% 32%,
        rgba(255, 220, 170, 0.9) 0%,
        #d4894a 30%,
        #a0522d 60%,
        #7a3a1a 100%
      );
      box-shadow: 0 0 16px rgba(212, 137, 74, 0.3),
                  inset -4px -4px 10px rgba(0,0,0,0.35);
    }

    /* Exoplanet colors by type */
    .planet-type--rocky-terrestrial {
      background: radial-gradient(circle at 38% 32%,
        rgba(200,190,170,0.9) 0%, #9b8e7a 40%, #6b5d4a 100%);
      box-shadow: 0 0 12px rgba(155,142,122,0.3), inset -3px -3px 8px rgba(0,0,0,0.3);
    }
    .planet-type--super-earth {
      background: radial-gradient(circle at 38% 32%,
        rgba(160,230,200,0.9) 0%, #10b981 40%, #065f46 100%);
      box-shadow: 0 0 14px rgba(16,185,129,0.35), inset -3px -3px 8px rgba(0,0,0,0.3);
    }
    .planet-type--mini-neptune,
    .planet-type--neptunian {
      background: radial-gradient(circle at 38% 32%,
        rgba(150,200,255,0.9) 0%, #4a90d9 40%, #1a4a8a 100%);
      box-shadow: 0 0 14px rgba(74,144,217,0.35), inset -3px -3px 8px rgba(0,0,0,0.3);
    }
    .planet-type--jovian {
      background: radial-gradient(circle at 38% 32%,
        rgba(255,210,150,0.9) 0%, #c8784a 40%, #8a3a10 100%);
      box-shadow: 0 0 16px rgba(200,120,74,0.3), inset -4px -4px 10px rgba(0,0,0,0.35);
    }
    .planet-type--hot-jupiter {
      background: radial-gradient(circle at 38% 32%,
        rgba(255,180,100,0.9) 0%, #e05a10 40%, #8a2000 100%);
      box-shadow: 0 0 20px rgba(224,90,16,0.4), inset -4px -4px 10px rgba(0,0,0,0.35);
    }
    .planet-type--cold-giant {
      background: radial-gradient(circle at 38% 32%,
        rgba(190,210,240,0.9) 0%, #8ab0d0 40%, #3a5a7a 100%);
      box-shadow: 0 0 14px rgba(138,176,208,0.3), inset -4px -4px 10px rgba(0,0,0,0.35);
    }
    .planet-type--unknown {
      background: radial-gradient(circle at 38% 32%,
        rgba(160,160,180,0.9) 0%, #7070a0 40%, #303050 100%);
      box-shadow: 0 0 12px rgba(112,112,160,0.3), inset -3px -3px 8px rgba(0,0,0,0.3);
    }

    .baseline {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(77,138,255,0.15), transparent);
      margin: 0 8px;
    }

    .body-name {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #8892b0;
      text-align: center;
      margin-top: 8px;
    }

    .planet-name-label {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .body-radius {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #4a5568;
      margin-top: 2px;
    }

    .scale-note {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #4a5568;
      text-align: center;
      margin-top: 12px;
      letter-spacing: 0.3px;
    }

    @media (max-width: 480px) {
      .comparison-stage {
        gap: 20px;
      }
    }
  `,
})
export class SizeComparisonComponent {
  planet = input.required<Exoplanet>();

  readonly MAX_PX = MAX_PX;
  readonly JUPITER_R = JUPITER_R;

  sizes = computed(() => {
    const r = this.planet()?.radiusEarth ?? 1;
    const showJupiter = r > 3;
    const maxR = showJupiter ? Math.max(r, JUPITER_R) : Math.max(r, 1);

    const toPx = (radius: number) =>
      Math.max(MIN_PX, Math.round(MAX_PX * radius / maxR));

    return {
      earthPx: toPx(1),
      jupiterPx: toPx(JUPITER_R),
      planetPx: toPx(r),
      showJupiter,
    };
  });
}

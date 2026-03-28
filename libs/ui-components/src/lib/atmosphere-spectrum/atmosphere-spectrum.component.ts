import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AtmosphereData } from '@exodex/shared-types';

@Component({
  selector: 'app-atmosphere-spectrum',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="atmosphere-section">
      <div class="spectrum-header">
        <div class="header-info">
          <span class="telescope-badge">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" width="12" height="12">
              <path d="M10 3l3 5-10 6-3-5z" fill="rgba(34,211,238,0.15)"/>
              <path d="M5 11l-2 4"/><path d="M3 15h4"/>
              <circle cx="12" cy="4" r="1.2" fill="rgba(34,211,238,0.3)"/>
            </svg>
            {{ data().telescope }} · {{ data().year }}
          </span>
        </div>
      </div>

      <!-- Spectrum SVG -->
      <div class="spectrum-container" [innerHTML]="spectrumSvg()"></div>

      <!-- Element legend -->
      <div class="elements-legend">
        @for (el of data().elements; track el.symbol) {
          <div class="element-pill" [class.tentative]="el.confidence === 'tentative'">
            <span class="element-dot" [style.background]="el.color" [style.box-shadow]="'0 0 6px ' + el.color + '80'"></span>
            <span class="element-symbol">{{ el.symbol }}</span>
            <span class="element-name">{{ el.name }}</span>
            @if (el.confidence === 'tentative') {
              <span class="tentative-label">?</span>
            }
          </div>
        }
      </div>

      <!-- Notes -->
      <p class="atmosphere-notes">{{ data().notes }}</p>
    </div>
  `,
  styles: `
    .atmosphere-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .spectrum-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .telescope-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #22d3ee;
      background: rgba(34, 211, 238, 0.08);
      border: 1px solid rgba(34, 211, 238, 0.15);
      border-radius: 8px;
      padding: 5px 10px;
    }

    .spectrum-container {
      background: rgba(10, 14, 28, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 16px;
      overflow: hidden;
    }

    .spectrum-container :deep(svg) {
      width: 100%;
      height: auto;
      display: block;
    }

    .elements-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .element-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      background: rgba(15, 20, 40, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      transition: all 200ms ease;
    }

    .element-pill:hover {
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(15, 20, 40, 0.8);
    }

    .element-pill.tentative {
      border-style: dashed;
      opacity: 0.7;
    }

    .element-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .element-symbol {
      color: #e8eeff;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }

    .element-name {
      color: #5a6177;
      font-size: 10px;
    }

    .tentative-label {
      color: #f59e0b;
      font-size: 10px;
      font-weight: 700;
    }

    .atmosphere-notes {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #5a6177;
      line-height: 1.6;
      font-style: italic;
      padding: 10px 12px;
      background: rgba(10, 14, 28, 0.3);
      border-radius: 8px;
      border-left: 2px solid rgba(34, 211, 238, 0.2);
    }

    @media (max-width: 480px) {
      .spectrum-container {
        padding: 10px;
      }

      .elements-legend {
        gap: 6px;
      }

      .element-pill {
        padding: 4px 8px;
        font-size: 10px;
      }
    }
  `,
})
export class AtmosphereSpectrumComponent {
  data = input.required<AtmosphereData>();

  private sanitizer: DomSanitizer;

  constructor(sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  spectrumSvg = computed<SafeHtml>(() => {
    const atm = this.data();
    if (!atm || !atm.elements.length) return '';

    const width = 500;
    const height = 100;
    const spectrumY = 20;
    const spectrumH = 40;

    // Visible spectrum: 380nm to 750nm, extended to IR representation
    const minWl = 380;
    const maxWl = 5000; // Extended to near-IR for molecules

    // Map wavelength to x position (logarithmic scale for wider range)
    const wlToX = (wl: number) => {
      const logMin = Math.log10(minWl);
      const logMax = Math.log10(maxWl);
      const logWl = Math.log10(Math.max(minWl, Math.min(maxWl, wl)));
      return 30 + ((logWl - logMin) / (logMax - logMin)) * (width - 60);
    };

    // Generate visible spectrum gradient
    let spectrumGradient = '';
    const stops: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const pct = i * 5;
      const wl = minWl + (750 - minWl) * (pct / 100);
      const color = this.wavelengthToColor(wl);
      stops.push(`<stop offset="${pct}%" stop-color="${color}" />`);
    }
    // Fade into IR region
    stops.push(`<stop offset="100%" stop-color="#330000" />`);

    spectrumGradient = `
      <defs>
        <linearGradient id="spec-grad">${stops.join('')}</linearGradient>
      </defs>
    `;

    // Base spectrum bar
    const spectrumBar = `
      <rect x="30" y="${spectrumY}" width="${width - 60}" height="${spectrumH}" rx="4"
            fill="url(#spec-grad)" opacity="0.8" />
    `;

    // IR region label
    const visibleEndX = wlToX(750);
    const irLabel = `
      <rect x="${visibleEndX}" y="${spectrumY}" width="${width - 30 - visibleEndX}" height="${spectrumH}" rx="0"
            fill="rgba(50,0,0,0.5)" />
      <text x="${(visibleEndX + width - 30) / 2}" y="${spectrumY + spectrumH / 2 + 3}"
            text-anchor="middle" fill="rgba(255,100,100,0.4)" font-size="8" font-family="Inter">IR</text>
    `;

    // Absorption lines
    let absorptionLines = '';
    for (const el of atm.elements) {
      const x = wlToX(el.wavelengthNm);
      const bw = Math.max(3, (el.bandWidthNm / (maxWl - minWl)) * (width - 60) * 2);
      const isDashed = el.confidence === 'tentative';

      absorptionLines += `
        <rect x="${x - bw / 2}" y="${spectrumY - 2}" width="${bw}" height="${spectrumH + 4}" rx="1"
              fill="${el.color}" opacity="0.25" />
        <line x1="${x}" y1="${spectrumY - 4}" x2="${x}" y2="${spectrumY + spectrumH + 4}"
              stroke="${el.color}" stroke-width="1.5" opacity="0.9"
              ${isDashed ? 'stroke-dasharray="3 2"' : ''} />
        <line x1="${x}" y1="${spectrumY + spectrumH + 6}" x2="${x}" y2="${spectrumY + spectrumH + 18}"
              stroke="${el.color}" stroke-width="0.8" opacity="0.5" />
        <text x="${x}" y="${spectrumY + spectrumH + 28}" text-anchor="middle"
              fill="${el.color}" font-size="8" font-family="JetBrains Mono" font-weight="600">${el.symbol}</text>
      `;
    }

    // Axis labels
    const axisLabels = `
      <text x="30" y="${spectrumY + spectrumH + 46}" fill="#4a5568" font-size="7" font-family="Inter">380nm</text>
      <text x="${visibleEndX}" y="${spectrumY + spectrumH + 46}" text-anchor="middle" fill="#4a5568" font-size="7" font-family="Inter">750nm</text>
      <text x="${width - 30}" y="${spectrumY + spectrumH + 46}" text-anchor="end" fill="#4a5568" font-size="7" font-family="Inter">IR →</text>
      <line x1="30" y1="${spectrumY + spectrumH + 36}" x2="${width - 30}" y2="${spectrumY + spectrumH + 36}"
            stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />
    `;

    // Title area
    const title = `
      <text x="30" y="12" fill="#5a6177" font-size="8" font-family="Orbitron" letter-spacing="1" text-transform="uppercase">
        TRANSMISSION SPECTRUM
      </text>
    `;

    const svg = `<svg viewBox="0 0 ${width} ${spectrumY + spectrumH + 55}" xmlns="http://www.w3.org/2000/svg">
      ${spectrumGradient}
      ${title}
      ${spectrumBar}
      ${irLabel}
      ${absorptionLines}
      ${axisLabels}
    </svg>`;

    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });

  private wavelengthToColor(wl: number): string {
    let r = 0, g = 0, b = 0;

    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wl >= 440 && wl < 490) {
      r = 0;
      g = (wl - 440) / (490 - 440);
      b = 1;
    } else if (wl >= 490 && wl < 510) {
      r = 0;
      g = 1;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wl >= 580 && wl < 645) {
      r = 1;
      g = -(wl - 645) / (645 - 580);
      b = 0;
    } else if (wl >= 645 && wl <= 750) {
      r = 1;
      g = 0;
      b = 0;
    }

    // Intensity adjustment at edges
    let factor = 1;
    if (wl >= 380 && wl < 420) factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
    else if (wl >= 700 && wl <= 750) factor = 0.3 + 0.7 * (750 - wl) / (750 - 700);

    r = Math.round(255 * r * factor);
    g = Math.round(255 * g * factor);
    b = Math.round(255 * b * factor);

    return `rgb(${r},${g},${b})`;
  }
}

import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, of } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExoplanetApiService } from '../../core/services/exoplanet-api.service';
import { Exoplanet } from '@exodex/shared-types';

interface MethodInfo {
  name: string;
  accentColor: string;
  iconSvg: string;
  diagramSvg: string;
}

/** Maps route slug → discoveryMethod value stored in planet data */
const SLUG_TO_METHOD: Record<string, string> = {
  'transit': 'Transit',
  'radial-velocity': 'Radial Velocity',
  'direct-imaging': 'Direct Imaging',
  'other': 'Other',
};

const METHODS: Record<string, MethodInfo> = {
  'transit': {
    name: 'transit',
    accentColor: '#4d8aff',
    iconSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="50" fill="#fbd38d" opacity="0.9"/>
      <circle cx="100" cy="100" r="55" fill="none" stroke="#fbd38d" stroke-width="0.5" opacity="0.4"/>
      <circle cx="100" cy="100" r="65" fill="none" stroke="#fbd38d" stroke-width="0.3" opacity="0.2"/>
      <circle cx="85" cy="90" r="10" fill="#1a1a2e"/>
      <circle cx="85" cy="90" r="11" fill="none" stroke="rgba(77,138,255,0.6)" stroke-width="1"/>
      <line x1="0" y1="90" x2="200" y2="90" stroke="rgba(77,138,255,0.15)" stroke-width="0.5" stroke-dasharray="4 4"/>
    </svg>`,
    diagramSvg: `<svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <line x1="20" y1="40" x2="380" y2="40" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" stroke-dasharray="4 4"/>
      <text x="10" y="84" fill="#5a6177" font-size="8" font-family="Inter">Brightness</text>
      <text x="370" y="95" fill="#5a6177" font-size="8" font-family="Inter">Time</text>
      <path d="M 20,40 L 120,40 C 135,40 140,75 155,75 C 170,75 175,40 185,40 L 380,40" stroke="#4d8aff" stroke-width="2" fill="none"/>
      <rect x="135" y="35" width="55" height="50" fill="rgba(77,138,255,0.08)" rx="4"/>
      <text x="148" y="30" fill="#4d8aff" font-size="9" font-family="Orbitron" opacity="0.7">Transit</text>
    </svg>`,

  },
  'radial-velocity': {
    name: 'radial-velocity',
    accentColor: '#a855f7',
    iconSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="100" r="40" fill="#fbd38d" opacity="0.8"/>
      <circle cx="145" cy="100" r="8" fill="#a855f7" opacity="0.8"/>
      <ellipse cx="110" cy="100" rx="55" ry="30" fill="none" stroke="rgba(168,85,247,0.3)" stroke-width="1" stroke-dasharray="4 4"/>
      <path d="M 50,100 L 30,100" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow)"/>
      <path d="M 130,100 L 150,100" stroke="#ef4444" stroke-width="2"/>
      <text x="20" y="90" fill="#6366f1" font-size="10" font-family="Inter">Blue</text>
      <text x="152" y="90" fill="#ef4444" font-size="10" font-family="Inter">Red</text>
    </svg>`,
    diagramSvg: `<svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="60" x2="380" y2="60" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <text x="10" y="64" fill="#5a6177" font-size="8" font-family="Inter">Velocity</text>
      <text x="370" y="95" fill="#5a6177" font-size="8" font-family="Inter">Time</text>
      <path d="M 20,60 Q 60,20 100,60 Q 140,100 180,60 Q 220,20 260,60 Q 300,100 340,60 Q 360,40 380,60" stroke="#a855f7" stroke-width="2" fill="none"/>
      <line x1="20" y1="20" x2="20" y2="100" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
      <text x="5" y="25" fill="#6366f1" font-size="7" font-family="Inter">→ us</text>
      <text x="5" y="105" fill="#ef4444" font-size="7" font-family="Inter">← us</text>
    </svg>`,

  },
  'direct-imaging': {
    name: 'direct-imaging',
    accentColor: '#22d3ee',
    iconSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="30" fill="#1a1a2e" stroke="rgba(34,211,238,0.3)" stroke-width="1"/>
      <circle cx="100" cy="100" r="35" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10" stroke-dasharray="1 10"/>
      <circle cx="145" cy="70" r="6" fill="#22d3ee" opacity="0.9"/>
      <circle cx="145" cy="70" r="10" fill="none" stroke="#22d3ee" stroke-width="0.5" opacity="0.4"/>
      <text x="70" y="105" fill="#5a6177" font-size="12" font-family="Orbitron">★</text>
      <text x="138" y="60" fill="#22d3ee" font-size="7" font-family="Inter">planet</text>
    </svg>`,
    diagramSvg: `<svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="60" r="40" fill="rgba(30,30,50,0.8)" stroke="rgba(34,211,238,0.2)" stroke-width="1"/>
      <circle cx="200" cy="60" r="15" fill="#fbd38d" opacity="0.3"/>
      <text x="188" y="65" fill="#5a6177" font-size="10" font-family="Inter">Blocked</text>
      <circle cx="280" cy="35" r="5" fill="#22d3ee" opacity="0.9"/>
      <circle cx="280" cy="35" r="9" fill="none" stroke="#22d3ee" stroke-width="0.8" opacity="0.4"/>
      <text x="295" y="38" fill="#22d3ee" font-size="8" font-family="Inter">Detected planet</text>
    </svg>`,

  },
  'other': {
    name: 'other',
    accentColor: '#f59e0b',
    iconSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="25" fill="#f59e0b" opacity="0.3"/>
      <circle cx="100" cy="100" r="40" fill="none" stroke="#f59e0b" stroke-width="0.5" opacity="0.3"/>
      <path d="M 60,140 Q 100,60 140,140" stroke="rgba(245,158,11,0.6)" stroke-width="2" fill="none"/>
      <circle cx="100" cy="80" r="4" fill="#f59e0b" opacity="0.8"/>
    </svg>`,
    diagramSvg: `<svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20,90 L 140,90 Q 200,20 260,90 L 380,90" stroke="#f59e0b" stroke-width="2" fill="none"/>
      <text x="180" y="15" fill="#f59e0b" font-size="9" font-family="Orbitron" opacity="0.7">Lens event</text>
      <circle cx="200" cy="55" r="3" fill="#f59e0b" opacity="0.8"/>
    </svg>`,

  }
};

@Component({
  selector: 'app-method-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (method(); as m) {
      <div class="method-page">
        <button class="back-btn" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {{ 'common.backToExodex' | translate }}
        </button>

        <div class="method-hero">
          <div class="method-icon" [innerHTML]="iconSvg()"></div>
          <div class="method-hero-text">
            <div class="method-label" [style.color]="m.accentColor">{{ 'methodsData.detectionMethod' | translate }}</div>
            <h1 class="method-title" [style.color]="m.accentColor">{{ 'methodsData.methods.' + m.name + '.title' | translate }}</h1>
            <p class="method-description">{{ 'methodsData.methods.' + m.name + '.description' | translate }}</p>
          </div>
        </div>

        <div class="method-content">
          <section class="method-section">
            <h2 [style.borderBottomColor]="m.accentColor + '30'">
              <span class="section-num" [style.color]="m.accentColor">01</span>
              {{ 'methodsData.howItWorks' | translate }}
            </h2>
            <p class="method-body">{{ 'methodsData.methods.' + m.name + '.howItWorks' | translate }}</p>
            <div class="method-diagram" [innerHTML]="diagramSvg()"></div>
          </section>

          <div class="method-columns">
            <section class="method-card advantages">
              <h3>
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
                {{ 'methodsData.advantages' | translate }}
              </h3>
              <ul>
                @for (adv of advantages(); track $index) {
                  <li>{{ adv }}</li>
                }
              </ul>
            </section>

            <section class="method-card limitations">
              <h3>
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 7v4M10 13h.01" stroke-linecap="round"/></svg>
                {{ 'methodsData.limitations' | translate }}
              </h3>
              <ul>
                @for (lim of limitations(); track $index) {
                  <li>{{ lim }}</li>
                }
              </ul>
            </section>
          </div>

          <section class="method-section">
            <h2 [style.borderBottomColor]="m.accentColor + '30'">
              <span class="section-num" [style.color]="m.accentColor">02</span>
              {{ 'methodsData.notableDiscoveries' | translate }}
            </h2>
            <div class="example-planets">
              @for (planet of examplePlanets(); track planet.id) {
                <a class="example-planet-chip" [routerLink]="['/planeta', planet.id]" [style.borderColor]="m.accentColor + '30'">
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none"><circle cx="8" cy="8" r="5" [attr.fill]="m.accentColor" opacity="0.6"/></svg>
                  {{ planet.name }}
                  <svg class="chip-arrow" viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4l4 4-4 4"/></svg>
                </a>
              }
            </div>
          </section>
        </div>
      </div>
    } @else {
      <div class="error-state">
        <h2>{{ 'methodsData.notFound' | translate }}</h2>
        <p>{{ 'methodsData.notFoundDesc' | translate }}</p>
        <button class="back-btn" (click)="goBack()">{{ 'common.backToExodex' | translate }}</button>
      </div>
    }
  `,
  styles: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .method-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px;
      animation: fadeInUp 600ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 40px;
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

    .method-hero {
      display: flex;
      gap: 32px;
      align-items: center;
      margin-bottom: 48px;
      padding: 32px;
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
    }

    .method-icon {
      width: 160px;
      height: 160px;
      flex-shrink: 0;
    }

    .method-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .method-label {
      font-family: 'Orbitron', sans-serif;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
      opacity: 0.8;
    }

    .method-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.8rem;
      font-weight: 900;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }

    .method-description {
      color: #8892b0;
      font-size: 15px;
      line-height: 1.7;
      font-family: 'Inter', sans-serif;
    }

    .method-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .method-section {
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 28px;
    }

    .method-section h2 {
      font-family: 'Orbitron', sans-serif;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #e8eeff;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid;
    }

    .section-num {
      font-size: 24px;
      font-weight: 900;
      opacity: 0.3;
    }

    .method-body {
      color: #8892b0;
      font-size: 14px;
      line-height: 1.8;
      font-family: 'Inter', sans-serif;
    }

    .method-diagram {
      margin-top: 24px;
      padding: 20px;
      background: rgba(10, 14, 28, 0.5);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .method-diagram :deep(svg) {
      width: 100%;
      height: auto;
    }

    .method-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .method-card {
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px;
    }

    .method-card h3 {
      font-family: 'Orbitron', sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #e8eeff;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .method-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .method-card li {
      color: #8892b0;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      line-height: 1.5;
    }

    .method-card li:last-child {
      border-bottom: none;
    }

    .advantages li::before { content: '✓ '; color: #22c55e; font-weight: bold; }
    .limitations li::before { content: '⚠ '; color: #f59e0b; }

    .example-planets {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .example-planet-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: rgba(10, 14, 28, 0.5);
      border: 1px solid;
      border-radius: 10px;
      color: #e8eeff;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      text-decoration: none;
      cursor: pointer;
      transition: all 300ms ease;
    }

    .example-planet-chip:hover {
      background: rgba(77, 138, 255, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .chip-arrow {
      opacity: 0.3;
      transition: all 300ms ease;
    }

    .example-planet-chip:hover .chip-arrow {
      opacity: 0.8;
      transform: translateX(2px);
    }

    .error-state {
      text-align: center;
      padding: 80px;
      animation: fadeInUp 600ms ease;
    }

    .error-state h2 { color: #e8eeff; margin-bottom: 8px; }
    .error-state p { color: #8892b0; margin-bottom: 24px; }

    @media (max-width: 768px) {
      .method-hero {
        flex-direction: column;
        text-align: center;
      }
      .method-columns {
        grid-template-columns: 1fr;
      }
      .method-icon { width: 120px; height: 120px; }
      .method-title { font-size: 1.3rem; }
    }
  `
})
export class MethodPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private translateService = inject(TranslateService);
  private apiService = inject(ExoplanetApiService);

  private langChange = toSignal(
    this.translateService.onLangChange,
    { initialValue: null }
  );

  private slug = toSignal(
    this.route.params.pipe(map(p => p['name'] as string)),
    { initialValue: '' }
  );

  advantages = computed<string[]>(() => {
    this.langChange();
    const m = this.method();
    if (!m) return [];
    const result = this.translateService.instant(`methodsData.methods.${m.name}.advantages`);
    return Array.isArray(result) ? result : [];
  });

  limitations = computed<string[]>(() => {
    this.langChange();
    const m = this.method();
    if (!m) return [];
    const result = this.translateService.instant(`methodsData.methods.${m.name}.limitations`);
    return Array.isArray(result) ? result : [];
  });

  method = computed(() => {
    const s = this.slug();
    if (!s) return null;
    return METHODS[s] || null;
  });

  /** Real planets discovered with this method, fetched from the data service */
  private examplePlanets$ = this.route.params.pipe(
    map(p => p['name'] as string),
    switchMap(slug => {
      const discoveryMethod = SLUG_TO_METHOD[slug];
      if (!discoveryMethod) return of([]);
      return this.apiService.getExoplanets$(
        { discoveryMethods: [discoveryMethod] } as any,
        { field: 'discoveryYear', direction: 'asc' },
        1,
        6
      ).pipe(
        map(res => res.data)
      );
    })
  );

  examplePlanets = toSignal(this.examplePlanets$, { initialValue: [] as Exoplanet[] });

  iconSvg = computed<SafeHtml>(() => {
    const m = this.method();
    return m ? this.sanitizer.bypassSecurityTrustHtml(m.iconSvg) : '';
  });

  diagramSvg = computed<SafeHtml>(() => {
    const m = this.method();
    return m ? this.sanitizer.bypassSecurityTrustHtml(m.diagramSvg) : '';
  });

  goBack(): void {
    this.router.navigate(['/']);
  }
}

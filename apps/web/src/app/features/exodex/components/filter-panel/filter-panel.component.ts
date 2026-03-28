import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs';
import { FilterStateService } from '../../../../core/services/filter-state.service';
import { ExoplanetApiService } from '../../../../core/services/exoplanet-api.service';
import { SearchInputComponent } from '@exodex/ui-components';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-panel">
      <div class="filter-section">
        <app-search-input
          [placeholder]="'common.searchPlanet' | translate"
          (search)="onSearch($event)"
        />
      </div>

      <!-- Planet Type Filter con SVG icons -->
      <div class="filter-section">
        <h3><span class="section-indicator"></span>{{ 'filters.planetType' | translate }}</h3>
        <div class="type-grid">
          @for (type of planetTypes(); track type.value) {
            <button
              class="type-chip"
              [class.selected]="isTypeSelected(type.value)"
              (click)="toggleType(type.value)"
            >
              <div class="type-icon" [innerHTML]="type.icon"></div>
              <span class="type-label">{{ type.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Habitability Filter con iconos -->
      <div class="filter-section">
        <h3><span class="section-indicator"></span>{{ 'filters.habitability' | translate }}</h3>
        <div class="hab-grid">
          @for (h of habitabilityOptions(); track h.value) {
            <button
              class="hab-chip"
              [class.selected]="isHabitabilitySelected(h.value)"
              [class]="'hab-chip--' + h.value"
              (click)="toggleHabitability(h.value)"
            >
              <span class="hab-icon" [innerHTML]="h.icon"></span>
              <span class="hab-label">{{ h.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Discovery Method Filter -->
      @if (discoveryMethods().length > 0) {
        <div class="filter-section">
          <h3><span class="section-indicator"></span>{{ 'filters.discoveryMethod' | translate }}</h3>
          <div class="method-grid">
            @for (m of discoveryMethods(); track m.value) {
              <button
                class="method-chip"
                [class.selected]="isMethodSelected(m.value)"
                (click)="toggleMethod(m.value)"
              >
                <div class="method-icon" [innerHTML]="m.icon"></div>
                <span class="method-label">{{ m.label }}</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- Stellar Class Filter -->
      <div class="filter-section">
        <h3><span class="section-indicator"></span>{{ 'filters.stellarClass' | translate }}</h3>
        <div class="star-grid">
          @for (sc of stellarClasses; track sc.value) {
            <button
              class="star-chip star-chip--{{ sc.value.toLowerCase() }}"
              [class.selected]="isStellarClassSelected(sc.value)"
              (click)="toggleStellarClass(sc.value)"
            >
              <div class="star-icon" [innerHTML]="sc.icon"></div>
              <span class="star-label">{{ sc.value }}</span>
            </button>
          }
        </div>
      </div>

      @if (stats(); as s) {
        <div class="filter-section">
          <h3><span class="section-indicator"></span>{{ 'filters.discoveryYear' | translate }}</h3>
          <div class="range-inputs">
            <input
              type="number"
              [min]="s.yearRange[0]"
              [max]="s.yearRange[1]"
              [value]="filters().discoveryYearRange?.[0] ?? s.yearRange[0]"
              (change)="updateYearRange($event, 0)"
            />
            <span class="range-separator">→</span>
            <input
              type="number"
              [min]="s.yearRange[0]"
              [max]="s.yearRange[1]"
              [value]="filters().discoveryYearRange?.[1] ?? s.yearRange[1]"
              (change)="updateYearRange($event, 1)"
            />
          </div>
        </div>
      }

      @if (filterState.hasActiveFilters()) {
        <button
          class="clear-btn"
          (click)="filterState.resetFilters()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          {{ 'common.clearFilters' | translate }}
        </button>
      }
    </div>
  `,
  styles: `
    .filter-panel {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .filter-section h3 {
      font-family: 'Orbitron', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(77, 138, 255, 0.6);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-indicator {
      display: inline-block;
      width: 3px;
      height: 12px;
      background: linear-gradient(180deg, #4d8aff, #a855f7);
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(77, 138, 255, 0.4);
    }

    /* ═══ Planet Type Grid ═══ */
    .type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 6px;
    }

    .type-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(15, 20, 40, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #8892b0;
      cursor: pointer;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 11px;
      font-weight: 500;
      text-align: left;
      min-width: 0;
    }

    .type-chip:hover {
      background: rgba(77, 138, 255, 0.06);
      border-color: rgba(77, 138, 255, 0.15);
      color: #e8eeff;
    }

    .type-chip.selected {
      background: rgba(77, 138, 255, 0.1);
      border-color: rgba(77, 138, 255, 0.3);
      color: #4d8aff;
      box-shadow: 0 0 10px rgba(77, 138, 255, 0.1);
    }

    .type-chip.selected .type-icon {
      filter: drop-shadow(0 0 4px rgba(77, 138, 255, 0.5));
    }

    .type-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: filter 300ms ease;
    }

    .type-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .type-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ═══ Habitability Grid ═══ */
    .hab-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 6px;
    }

    .hab-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(15, 20, 40, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #8892b0;
      cursor: pointer;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 11px;
      font-weight: 500;
      text-align: left;
      min-width: 0;
    }

    .hab-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hab-chip:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.12);
      color: #e8eeff;
    }

    .hab-chip.selected.hab-chip--potentially-habitable {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
      color: #10b981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.1);
    }

    .hab-chip.selected.hab-chip--marginal {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
      color: #f59e0b;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.1);
    }

    .hab-chip.selected.hab-chip--uninhabitable {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
    }

    .hab-chip.selected.hab-chip--unknown {
      background: rgba(136, 146, 176, 0.1);
      border-color: rgba(136, 146, 176, 0.25);
      color: #8892b0;
    }

    .hab-icon {
      font-size: 16px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .hab-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    /* ═══ Stellar Class Grid ═══ */
    .star-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }

    .star-chip--o { --star-rgb: 140, 168, 255; }
    .star-chip--b { --star-rgb: 214, 229, 255; }
    .star-chip--a { --star-rgb: 255, 255, 255; }
    .star-chip--f { --star-rgb: 255, 244, 232; }
    .star-chip--g { --star-rgb: 255, 218, 117; }
    .star-chip--k { --star-rgb: 255, 157, 92; }
    .star-chip--m { --star-rgb: 255, 91, 79; }

    .star-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 4px;
      border-radius: 10px;
      /* Background tint using star color variable */
      background: rgba(var(--star-rgb, 136, 146, 176), 0.08); /* Fallback si no hay variable */
      border: 1px solid rgba(var(--star-rgb, 255, 255, 255), 0.1);
      color: #8892b0;
      cursor: pointer;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 13px;
      font-weight: 700;
      font-family: 'Orbitron', monospace;
      min-width: 0;
    }

    .star-chip:hover {
      background: rgba(var(--star-rgb), 0.15);
      border-color: rgba(var(--star-rgb), 0.35);
      color: #e8eeff;
      box-shadow: 0 4px 12px rgba(var(--star-rgb), 0.1);
    }

    .star-chip.selected {
      background: rgba(var(--star-rgb), 0.25);
      border-color: rgba(var(--star-rgb), 0.7);
      color: #ffffff;
      box-shadow: 0 0 16px rgba(var(--star-rgb), 0.35);
    }

    .star-chip.selected .star-icon {
      transform: scale(1.15);
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
    }

    .star-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 300ms ease;
    }

    .star-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    /* ═══ Discovery Method Grid ═══ */
    .method-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .method-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(15, 20, 40, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #8892b0;
      cursor: pointer;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 11px;
      font-weight: 500;
      text-align: left;
      min-width: 0;
    }

    .method-chip:hover {
      background: rgba(77, 138, 255, 0.06);
      border-color: rgba(77, 138, 255, 0.15);
      color: #e8eeff;
    }

    .method-chip.selected {
      background: rgba(77, 138, 255, 0.1);
      border-color: rgba(77, 138, 255, 0.3);
      color: #4d8aff;
      box-shadow: 0 0 10px rgba(77, 138, 255, 0.1);
    }

    .method-chip.selected .method-icon {
      filter: drop-shadow(0 0 4px rgba(77, 138, 255, 0.5));
    }

    .method-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: filter 300ms ease;
    }

    .method-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .method-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ═══ Range Inputs ═══ */
    .range-inputs {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .range-inputs input {
      width: 80px;
      padding: 8px 10px;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(15, 20, 40, 0.6);
      border: 1px solid rgba(77, 138, 255, 0.1);
      border-radius: 10px;
      color: #e8eeff;
      text-align: center;
      -moz-appearance: textfield;
    }

    .range-inputs input::-webkit-outer-spin-button,
    .range-inputs input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .range-separator {
      color: rgba(77, 138, 255, 0.4);
      font-size: 14px;
    }

    /* ═══ Clear Button ═══ */
    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      color: #ef4444;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 300ms ease;
      font-family: 'Inter', sans-serif;
    }

    .clear-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
    }

    @media (max-width: 480px) {
      .filter-panel {
        padding: 20px 16px;
        gap: 22px;
      }

      .star-grid {
        grid-template-columns: repeat(4, 1fr);
      }

      .type-grid, .hab-grid {
        grid-template-columns: 1fr 1fr;
      }

      .range-inputs input {
        width: 70px;
        padding: 6px 8px;
        font-size: 12px;
      }
    }
  `,
})
export class FilterPanelComponent {
  protected filterState = inject(FilterStateService);
  private apiService = inject(ExoplanetApiService);
  private translate = inject(TranslateService);
  private sanitizer = inject(DomSanitizer);

  filters = this.filterState.filters;
  stats = toSignal(this.apiService.getStats$().pipe(startWith(null)));

  private trust(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // SVG icons for planet types — mini procedural planets
  private planetIcons: Record<string, string> = {
    'rocky-terrestrial': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="#7a8a5c" opacity="0.8"/>
      <circle cx="12" cy="12" r="9" fill="url(#rt)" />
      <circle cx="8" cy="9" r="2" fill="rgba(0,0,0,0.15)" />
      <circle cx="15" cy="14" r="1.5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="12" cy="12" rx="9" ry="9" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
      <defs><radialGradient id="rt" cx="35%" cy="35%"><stop offset="0%" stop-color="rgba(255,255,255,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>
    </svg>`,
    'super-earth': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#4a9e6b" opacity="0.8"/>
      <circle cx="12" cy="12" r="10" fill="url(#se)" />
      <path d="M7 10 Q12 8 17 11" stroke="rgba(100,180,130,0.4)" stroke-width="1.5" fill="none"/>
      <path d="M5 14 Q10 12 18 15" stroke="rgba(80,160,110,0.3)" stroke-width="1" fill="none"/>
      <circle cx="9" cy="13" r="2.5" fill="rgba(60,140,90,0.3)" />
      <defs><radialGradient id="se" cx="30%" cy="30%"><stop offset="0%" stop-color="rgba(255,255,255,0.25)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>
    </svg>`,
    'mini-neptune': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="#4a7db8" opacity="0.8"/>
      <circle cx="12" cy="12" r="9" fill="url(#mn)" />
      <path d="M3 11 Q12 9 21 11" stroke="rgba(100,170,220,0.4)" stroke-width="1.2" fill="none"/>
      <path d="M4 13 Q12 15 20 13" stroke="rgba(80,150,200,0.3)" stroke-width="0.8" fill="none"/>
      <defs><radialGradient id="mn" cx="35%" cy="35%"><stop offset="0%" stop-color="rgba(255,255,255,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>
    </svg>`,
    'neptunian': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#3b6fa0" opacity="0.8"/>
      <circle cx="12" cy="12" r="10" fill="url(#np)" />
      <path d="M2 10 Q12 8 22 10" stroke="rgba(80,160,220,0.5)" stroke-width="1.5" fill="none"/>
      <path d="M3 13 Q12 15 21 13" stroke="rgba(60,140,200,0.4)" stroke-width="1.2" fill="none"/>
      <path d="M4 16 Q12 14 20 16" stroke="rgba(50,120,180,0.3)" stroke-width="0.8" fill="none"/>
      <defs><radialGradient id="np" cx="30%" cy="30%"><stop offset="0%" stop-color="rgba(255,255,255,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>
    </svg>`,
    'jovian': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#c4915a" opacity="0.8"/>
      <circle cx="12" cy="12" r="11" fill="url(#jv)" />
      <path d="M1 9 Q12 7 23 9" stroke="rgba(200,160,100,0.5)" stroke-width="1.8" fill="none"/>
      <path d="M1 12 Q12 14 23 12" stroke="rgba(180,120,70,0.4)" stroke-width="1.5" fill="none"/>
      <path d="M2 15 Q12 13 22 15" stroke="rgba(160,100,50,0.3)" stroke-width="1.2" fill="none"/>
      <ellipse cx="16" cy="13" rx="2.5" ry="2" fill="rgba(200,100,60,0.4)" />
      <defs><radialGradient id="jv" cx="30%" cy="30%"><stop offset="0%" stop-color="rgba(255,255,255,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>
    </svg>`,
    'hot-jupiter': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#d4734a" opacity="0.85"/>
      <circle cx="12" cy="12" r="11" fill="url(#hj)" />
      <path d="M1 8 Q12 6 23 8" stroke="rgba(255,150,80,0.5)" stroke-width="1.5" fill="none"/>
      <path d="M1 11 Q12 13 23 11" stroke="rgba(220,100,50,0.4)" stroke-width="1.2" fill="none"/>
      <path d="M2 14 Q12 12 22 14" stroke="rgba(200,80,40,0.3)" stroke-width="1" fill="none"/>
      <circle cx="0" cy="12" r="14" fill="none" stroke="rgba(255,120,50,0.15)" stroke-width="0.5"/>
      <defs><radialGradient id="hj" cx="25%" cy="30%"><stop offset="0%" stop-color="rgba(255,220,150,0.3)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>
    </svg>`,
    'cold-giant': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#6b84a8" opacity="0.8"/>
      <circle cx="12" cy="12" r="11" fill="url(#cg)" />
      <path d="M1 10 Q12 8 23 10" stroke="rgba(140,170,200,0.4)" stroke-width="1.5" fill="none"/>
      <path d="M2 13 Q12 15 22 13" stroke="rgba(120,150,180,0.3)" stroke-width="1.2" fill="none"/>
      <ellipse cx="12" cy="12" rx="14" ry="3" fill="none" stroke="rgba(180,200,220,0.2)" stroke-width="0.8" transform="rotate(-10 12 12)"/>
      <defs><radialGradient id="cg" cx="35%" cy="30%"><stop offset="0%" stop-color="rgba(255,255,255,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>
    </svg>`,
  };

  // SVG icons for habitability
  private habitabilityIcons: Record<string, string> = {
    'potentially-habitable': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3 C10 3 6 7 6 11 C6 13.2 7.8 15 10 15 C12.2 15 14 13.2 14 11 C14 7 10 3 10 3Z" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="1.2"/>
      <path d="M10 15 L10 18" stroke="#10b981" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M8 17 L12 17" stroke="#10b981" stroke-width="1" stroke-linecap="round"/>
      <path d="M8 9 Q10 7 10 10" stroke="#10b981" stroke-width="0.8" stroke-linecap="round" fill="none"/>
    </svg>`,
    'marginal': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" stroke="#f59e0b" stroke-width="1.2" fill="rgba(245,158,11,0.1)"/>
      <path d="M10 6 L10 11" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="14" r="0.8" fill="#f59e0b"/>
    </svg>`,
    'uninhabitable': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="8" r="5" stroke="#ef4444" stroke-width="1.2" fill="rgba(239,68,68,0.1)"/>
      <path d="M7 7 L8.5 8.5 M13 7 L11.5 8.5" stroke="#ef4444" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M8 10.5 Q10 9 12 10.5" stroke="#ef4444" stroke-width="1" stroke-linecap="round" fill="none"/>
      <path d="M10 13 L10 17" stroke="#ef4444" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M7 15 L13 15" stroke="#ef4444" stroke-width="1" stroke-linecap="round"/>
    </svg>`,
    'unknown': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" stroke="#8892b0" stroke-width="1.2" fill="rgba(136,146,176,0.08)"/>
      <path d="M8 8 Q8 5 10 5 Q12 5 12 7.5 Q12 9 10 9.5 L10 11" stroke="#8892b0" stroke-width="1.2" stroke-linecap="round" fill="none"/>
      <circle cx="10" cy="13.5" r="0.8" fill="#8892b0"/>
    </svg>`,
  };

  private methodIcons: Record<string, string> = {
    'Transit': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="4" r="2.5" fill="currentColor" opacity="0.7"/><path d="M2 17 L7.5 17 C8.5 17 9.5 14 10.5 12 C11 11 11.5 10.5 12 10.5 C12.5 10.5 13 11 13.5 12 C14.5 14 15.5 17 16.5 17 L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    'Radial Velocity': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="0.5" opacity="0.4" stroke-dasharray="2 2"/><path d="M2 12 Q4.5 5 7 12 Q9.5 19 12 12 Q14.5 5 17 12 Q19.5 19 22 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
    'Imaging': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12 C4 6 8 4 12 4 C16 4 20 6 22 12 C20 18 16 20 12 20 C8 20 4 18 2 12Z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`,
    'Microlensing': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4 L8 12 L2 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4 L16 12 L22 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.2"/><circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.8"/></svg>`,
    'Astrometry': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="0.7" opacity="0.3"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="0.7" opacity="0.3"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.2"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 8 L12 5 M12 19 L12 16 M8 12 L5 12 M19 12 L16 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    'Transit Timing Variations': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="0.7" opacity="0.4"/><path d="M5 12 L10 7 L15 15 L20 9" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="10" cy="7" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/><circle cx="20" cy="9" r="1.5" fill="currentColor"/></svg>`,
    'Orbital Brightness Modulation': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="14" rx="9" ry="4" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><circle cx="12" cy="7" r="3" fill="currentColor" opacity="0.8"/><path d="M6 11 Q9 6 12 4 Q15 6 18 11" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`,
    'Pulsar Timing': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="2.5" fill="currentColor"/><circle cx="12" cy="12" r="5.5" stroke="currentColor" stroke-width="1" opacity="0.6"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="0.8" opacity="0.3"/><path d="M12 3 L12 1 M12 23 L12 21 M3 12 L1 12 M23 12 L21 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/></svg>`,
    'Eclipse Timing Variations': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="12" r="6" stroke="currentColor" stroke-width="1.3"/><circle cx="15" cy="12" r="6" stroke="currentColor" stroke-width="1.3" opacity="0.5"/></svg>`,
    'Pulsation Timing Variations': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.8"/><path d="M12 4 L13.4 8.6 L18.4 8.6 L14.5 11.4 L15.9 16 L12 13.2 L8.1 16 L9.5 11.4 L5.6 8.6 L10.6 8.6 Z" stroke="currentColor" stroke-width="1" fill="none" opacity="0.6"/></svg>`,
    'Disk Kinematics': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="6" ry="2.4" stroke="currentColor" stroke-width="1" opacity="0.6"/><circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.7"/></svg>`,
    '_default': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M9.5 9 Q9.5 6.5 12 6.5 Q14.5 6.5 14.5 9 Q14.5 11 12 11.5 L12 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="12" cy="15.5" r="0.8" fill="currentColor"/></svg>`,
  };

  private starIcons: Record<string, string> = {
    'O': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sg-o" cx="50%" cy="50%"><stop offset="0%" stop-color="#8ca8ff" stop-opacity="0.8"/><stop offset="60%" stop-color="#8ca8ff" stop-opacity="0.2"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#sg-o)" /><circle cx="12" cy="12" r="4" fill="#ffffff" /></svg>',
    'B': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sg-b" cx="50%" cy="50%"><stop offset="0%" stop-color="#d6e5ff" stop-opacity="0.8"/><stop offset="60%" stop-color="#d6e5ff" stop-opacity="0.2"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#sg-b)" /><circle cx="12" cy="12" r="4" fill="#ffffff" /></svg>',
    'A': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sg-a" cx="50%" cy="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/><stop offset="60%" stop-color="#ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#sg-a)" /><circle cx="12" cy="12" r="4" fill="#ffffff" /></svg>',
    'F': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sg-f" cx="50%" cy="50%"><stop offset="0%" stop-color="#fff4e8" stop-opacity="0.8"/><stop offset="60%" stop-color="#fff4e8" stop-opacity="0.2"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#sg-f)" /><circle cx="12" cy="12" r="4" fill="#ffffff" /></svg>',
    'G': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sg-g" cx="50%" cy="50%"><stop offset="0%" stop-color="#ffda75" stop-opacity="0.8"/><stop offset="60%" stop-color="#ffda75" stop-opacity="0.2"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#sg-g)" /><circle cx="12" cy="12" r="4" fill="#ffffff" /></svg>',
    'K': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sg-k" cx="50%" cy="50%"><stop offset="0%" stop-color="#ff9d5c" stop-opacity="0.8"/><stop offset="60%" stop-color="#ff9d5c" stop-opacity="0.2"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#sg-k)" /><circle cx="12" cy="12" r="4" fill="#ffffff" /></svg>',
    'M': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sg-m" cx="50%" cy="50%"><stop offset="0%" stop-color="#ff5b4f" stop-opacity="0.8"/><stop offset="60%" stop-color="#ff5b4f" stop-opacity="0.2"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#sg-m)" /><circle cx="12" cy="12" r="4" fill="#ffffff" /></svg>',
  };

  planetTypes = toSignal(
    this.translate.onLangChange.pipe(
      startWith(null),
      map(() => [
        { value: 'rocky-terrestrial', label: this.translate.instant('filters.planetTypes.rocky-terrestrial'), icon: this.trust(this.planetIcons['rocky-terrestrial']) },
        { value: 'super-earth', label: this.translate.instant('filters.planetTypes.super-earth'), icon: this.trust(this.planetIcons['super-earth']) },
        { value: 'mini-neptune', label: this.translate.instant('filters.planetTypes.mini-neptune'), icon: this.trust(this.planetIcons['mini-neptune']) },
        { value: 'neptunian', label: this.translate.instant('filters.planetTypes.neptunian'), icon: this.trust(this.planetIcons['neptunian']) },
        { value: 'jovian', label: this.translate.instant('filters.planetTypes.jovian'), icon: this.trust(this.planetIcons['jovian']) },
        { value: 'hot-jupiter', label: this.translate.instant('filters.planetTypes.hot-jupiter'), icon: this.trust(this.planetIcons['hot-jupiter']) },
        { value: 'cold-giant', label: this.translate.instant('filters.planetTypes.cold-giant'), icon: this.trust(this.planetIcons['cold-giant']) },
      ])
    ),
    { requireSync: true }
  );

  habitabilityOptions = toSignal(
    this.translate.onLangChange.pipe(
      startWith(null),
      map(() => [
        { value: 'potentially-habitable', label: this.translate.instant('filters.habitabilityOptions.potentially-habitable'), icon: this.trust(this.habitabilityIcons['potentially-habitable']) },
        { value: 'marginal', label: this.translate.instant('filters.habitabilityOptions.marginal'), icon: this.trust(this.habitabilityIcons['marginal']) },
        { value: 'uninhabitable', label: this.translate.instant('filters.habitabilityOptions.uninhabitable'), icon: this.trust(this.habitabilityIcons['uninhabitable']) },
        { value: 'unknown', label: this.translate.instant('filters.habitabilityOptions.unknown'), icon: this.trust(this.habitabilityIcons['unknown']) },
      ])
    ),
    { requireSync: true }
  );

  private langVersion = toSignal(
    this.translate.onLangChange.pipe(startWith(null), map(() => 0)),
    { initialValue: 0 }
  );

  /** Maps raw discovery method names from data to i18n translation keys */
  private methodToI18nKey: Record<string, string> = {
    'Direct Imaging': 'Imaging',
    'Imaging': 'Imaging',
    'Other': 'Other',
  };

  discoveryMethods = computed(() => {
    this.langVersion();
    const s = this.stats();
    if (!s) return [];
    return Object.entries(s.methodDistribution)
      .filter(([method, count]) => count > 0 && method !== 'Direct Imaging')
      .sort(([, a], [, b]) => b - a)
      .map(([method]) => {
        const i18nKey = this.methodToI18nKey[method] ?? method;
        return {
          value: method,
          label: this.translate.instant(`stats.methodNames.${i18nKey}`) || method,
          icon: this.trust(this.methodIcons[method] ?? this.methodIcons['_default']),
        };
      });
  });

  stellarClasses = [
    { value: 'O', icon: this.trust(this.starIcons['O']) },
    { value: 'B', icon: this.trust(this.starIcons['B']) },
    { value: 'A', icon: this.trust(this.starIcons['A']) },
    { value: 'F', icon: this.trust(this.starIcons['F']) },
    { value: 'G', icon: this.trust(this.starIcons['G']) },
    { value: 'K', icon: this.trust(this.starIcons['K']) },
    { value: 'M', icon: this.trust(this.starIcons['M']) },
  ];

  onSearch(query: string): void {
    this.filterState.updateFilter('searchQuery', query);
  }

  isTypeSelected(type: string): boolean {
    return this.filters().planetTypes.includes(type as never);
  }

  toggleType(type: string): void {
    const current = this.filters().planetTypes;
    const updated = current.includes(type as never)
      ? current.filter((t) => t !== type)
      : [...current, type as never];
    this.filterState.updateFilter('planetTypes', updated);
  }

  isHabitabilitySelected(h: string): boolean {
    return this.filters().habitabilityClasses.includes(h as never);
  }

  toggleHabitability(h: string): void {
    const current = this.filters().habitabilityClasses;
    const updated = current.includes(h as never)
      ? current.filter((x) => x !== h)
      : [...current, h as never];
    this.filterState.updateFilter('habitabilityClasses', updated);
  }

  isMethodSelected(method: string): boolean {
    return this.filters().discoveryMethods.includes(method as never);
  }

  toggleMethod(method: string): void {
    const current = this.filters().discoveryMethods;
    const updated = current.includes(method as never)
      ? current.filter((m) => m !== method)
      : [...current, method as never];
    this.filterState.updateFilter('discoveryMethods', updated);
  }

  isStellarClassSelected(sc: string): boolean {
    return this.filters().stellarClasses.includes(sc as never);
  }

  toggleStellarClass(sc: string): void {
    const current: string[] = this.filters().stellarClasses;
    const updated = current.includes(sc as never)
      ? current.filter((x) => x !== sc)
      : [...current, sc as never];
    this.filterState.updateFilter('stellarClasses', updated as any);
  }

  updateYearRange(event: Event, index: number): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    const current = this.filters().discoveryYearRange;
    const updated: [number, number] = current
      ? [...current] as [number, number]
      : [1992, new Date().getFullYear()];
    updated[index] = value;
    this.filterState.updateFilter('discoveryYearRange', updated);
  }
}

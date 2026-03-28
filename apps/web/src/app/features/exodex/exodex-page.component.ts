import {
  Component, inject, ChangeDetectionStrategy,
  AfterViewInit, OnDestroy, ElementRef, NgZone, ViewChild, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { FilterStateService } from '../../core/services/filter-state.service';
import { ExoplanetApiService } from '../../core/services/exoplanet-api.service';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { SortBarComponent } from './components/sort-bar/sort-bar.component';
import { PlanetGridComponent } from './components/planet-grid/planet-grid.component';
import { SearchInputComponent } from '@exodex/ui-components';
import { LanguageSwitcherComponent } from '../../core/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-exodex-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    FilterPanelComponent,
    SortBarComponent,
    PlanetGridComponent,
    SearchInputComponent,
    LanguageSwitcherComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="exodex-layout">
      <header class="exodex-header">
        <div class="header-left">
          <h1 class="logo">
            <span class="logo-icon">◈</span>
            <span class="logo-text">Exodex</span>
          </h1>
          @if (stats(); as s) {
            <span class="planet-count">
              <span class="count-number">{{ s.totalCount | number }}</span>
              {{ 'stats.exoplanets' | translate }}
            </span>
          }
        </div>
        <div class="header-right">
          <a routerLink="/about" class="about-link" title="About Exodex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
            </svg>
          </a>
          <app-language-switcher />
          <app-search-input
            class="header-search"
            [placeholder]="'common.search' | translate"
            (search)="onSearch($event)"
          />
          <button
            class="sidebar-toggle"
            (click)="filterState.toggleSidebar()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      <aside class="filter-sidebar" [class.open]="sidebarOpen()" #sidebarEl>
        <div class="filter-sidebar-inner">
          <app-filter-panel />
        </div>
      </aside>
      <div class="sidebar-overlay" [class.visible]="sidebarOpen()" (click)="filterState.toggleSidebar()"></div>

      <main class="exodex-main">
        <app-sort-bar />
        <app-planet-grid />
      </main>
    </div>
  `,
  styles: `
    .exodex-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      grid-template-rows: auto 1fr;
      grid-template-areas:
        "header header"
        "sidebar main";
      min-height: 100vh;
    }

    .exodex-header {
      grid-area: header;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: rgba(10, 15, 30, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(77, 138, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Orbitron', sans-serif;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .logo-icon {
      font-size: 26px;
      background: linear-gradient(135deg, #4d8aff, #a855f7, #22d3ee);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 4s ease infinite;
      filter: drop-shadow(0 0 8px rgba(77, 138, 255, 0.5));
    }

    .logo-text {
      background: linear-gradient(135deg, #e8eeff 0%, #4d8aff 50%, #a855f7 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 6s ease infinite;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .planet-count {
      font-size: 12px;
      color: #4a5568;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.5px;
    }

    .count-number {
      color: #4d8aff;
      font-weight: 600;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .about-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      color: #5a6177;
      background: rgba(77, 138, 255, 0.05);
      border: 1px solid rgba(77, 138, 255, 0.08);
      transition: all 300ms ease;
      text-decoration: none;
    }

    .about-link:hover {
      color: #4d8aff;
      background: rgba(77, 138, 255, 0.1);
      border-color: rgba(77, 138, 255, 0.2);
      box-shadow: 0 0 12px rgba(77, 138, 255, 0.15);
      text-shadow: none;
    }

    .header-search {
      width: 260px;
    }

    .sidebar-toggle {
      display: none;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      background: rgba(77, 138, 255, 0.08);
      border: 1px solid rgba(77, 138, 255, 0.15);
      border-radius: 10px;
      color: #8892b0;
      cursor: pointer;
      transition: all 300ms ease;
    }

    .sidebar-toggle:hover {
      background: rgba(77, 138, 255, 0.15);
      color: #e8eeff;
      box-shadow: 0 0 15px rgba(77, 138, 255, 0.2);
    }

    .sidebar-toggle svg {
      width: 20px;
      height: 20px;
    }

    .filter-sidebar {
      grid-area: sidebar;
      background: rgba(10, 15, 30, 0.5);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-right: 1px solid rgba(77, 138, 255, 0.08);
      /* Twitter-like sticky: position is sticky, top is dynamically set by JS */
      position: sticky;
      top: var(--sidebar-top, 65px);
      align-self: start;
      max-height: none;
      overflow: visible;
      transition: none;
    }

    .filter-sidebar-inner {
      /* Inner wrapper ensures we can measure actual content height */
    }

    .exodex-main {
      grid-area: main;
      padding: 0 24px 24px;
      min-height: 0;
    }

    @media (max-width: 1024px) {
      .exodex-layout {
        grid-template-columns: 1fr;
        grid-template-areas:
          "header"
          "main";
      }

      .filter-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 280px;
        height: 100vh;
        z-index: 100;
        transform: translateX(-100%);
        transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(10, 15, 30, 0.95);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }

      .filter-sidebar.open {
        transform: translateX(0);
        box-shadow: 20px 0 60px rgba(0, 0, 0, 0.5);
      }

      .sidebar-overlay {
        display: none;
      }

      .sidebar-overlay.visible {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 99;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        animation: fadeIn 300ms ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .sidebar-toggle {
        display: flex;
      }

      .header-search {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .exodex-header {
        padding: 12px 16px;
      }

      .exodex-main {
        padding: 0 16px 16px;
      }

      .logo {
        font-size: 18px;
      }

      .logo-icon {
        font-size: 20px;
      }

      .planet-count {
        display: none;
      }
    }
  `,
})
export class ExodexPageComponent implements AfterViewInit, OnDestroy {
  protected filterState = inject(FilterStateService);
  private apiService = inject(ExoplanetApiService);
  private zone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('sidebarEl', { static: false }) sidebarRef!: ElementRef<HTMLElement>;

  sidebarOpen = this.filterState.sidebarOpen;
  stats = toSignal(this.apiService.getStats$().pipe(startWith(null)));

  private lastScrollY = 0;
  private currentTop = 0;
  private headerHeight = 65; // Approximate sticky header height
  private scrollHandler: (() => void) | null = null;
  private rafId: number | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Read actual header height
    const header = document.querySelector('.exodex-header') as HTMLElement;
    if (header) {
      this.headerHeight = header.offsetHeight;
    }

    this.lastScrollY = window.scrollY;
    this.currentTop = this.headerHeight;
    this.updateSidebarTop();

    // Run scroll listener outside Angular zone for performance
    this.zone.runOutsideAngular(() => {
      this.scrollHandler = () => {
        if (this.rafId !== null) return;
        this.rafId = requestAnimationFrame(() => {
          this.onScroll();
          this.rafId = null;
        });
      };
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }

  onSearch(query: string): void {
    this.filterState.updateFilter('searchQuery', query);
  }

  /**
   * Twitter-like sticky sidebar logic:
   *
   * The sidebar is `position: sticky`. We dynamically compute `top` so that:
   *
   * 1. If sidebar fits in the viewport (sidebarH ≤ viewportH - headerH),
   *    simply stick at headerHeight.
   *
   * 2. If sidebar is TALLER than the viewport:
   *    - Scrolling DOWN → decrease `top` so the bottom of the sidebar
   *      eventually reaches the viewport bottom. Min value:
   *      -(sidebarH - viewportH)
   *    - Scrolling UP → increase `top` towards headerHeight so the
   *      top of the sidebar comes back into view.
   *    - When changing scroll direction, the sidebar "freezes" at its
   *      current visual position, then moves as you continue scrolling.
   */
  private onScroll(): void {
    const sidebar = this.sidebarRef?.nativeElement;
    if (!sidebar) return;

    const scrollY = window.scrollY;
    const delta = scrollY - this.lastScrollY;
    this.lastScrollY = scrollY;

    if (delta === 0) return;

    const sidebarH = sidebar.offsetHeight;
    const viewportH = window.innerHeight;

    // If sidebar fits entirely below the header, just stick at the top
    if (sidebarH <= viewportH - this.headerHeight) {
      this.currentTop = this.headerHeight;
      this.updateSidebarTop();
      return;
    }

    // The maximum sticky top (sidebar top aligned below header)
    const maxTop = this.headerHeight;
    // The minimum sticky top (sidebar bottom aligned to viewport bottom)
    const minTop = -(sidebarH - viewportH);

    // Adjust currentTop by the negative of scroll delta
    this.currentTop -= delta;

    // Clamp
    this.currentTop = Math.max(minTop, Math.min(maxTop, this.currentTop));

    this.updateSidebarTop();
  }

  private updateSidebarTop(): void {
    const sidebar = this.sidebarRef?.nativeElement;
    if (!sidebar) return;
    sidebar.style.setProperty('--sidebar-top', `${this.currentTop}px`);
  }
}

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { FilterStateService } from '../../core/services/filter-state.service';
import { ExoplanetApiService } from '../../core/services/exoplanet-api.service';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { SortBarComponent } from './components/sort-bar/sort-bar.component';
import { PlanetGridComponent } from './components/planet-grid/planet-grid.component';
import { SearchInputComponent } from '@exodex/ui-components';

@Component({
  selector: 'app-exodex-page',
  standalone: true,
  imports: [
    CommonModule,
    FilterPanelComponent,
    SortBarComponent,
    PlanetGridComponent,
    SearchInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="exodex-layout">
      <header class="exodex-header">
        <div class="header-left">
          <h1>Exodex</h1>
          @if (stats(); as s) {
            <span class="planet-count">
              {{ s.totalCount | number }} exoplanetas
            </span>
          }
        </div>
        <div class="header-right">
          <app-search-input
            class="header-search"
            placeholder="Buscar..."
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

      <aside class="filter-sidebar" [class.open]="sidebarOpen()">
        <app-filter-panel />
      </aside>

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
      background: #080b14;
    }

    .exodex-header {
      grid-area: header;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .header-left {
      display: flex;
      align-items: baseline;
      gap: 16px;
    }

    .header-left h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #f0f4ff;
      letter-spacing: -0.5px;
    }

    .planet-count {
      font-size: 13px;
      color: #8892b0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-search {
      width: 240px;
    }

    .sidebar-toggle {
      display: none;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      color: #8892b0;
      cursor: pointer;
    }

    .sidebar-toggle svg {
      width: 20px;
      height: 20px;
    }

    .filter-sidebar {
      grid-area: sidebar;
      background: rgba(255, 255, 255, 0.02);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      overflow-y: auto;
    }

    .exodex-main {
      grid-area: main;
      padding: 0 24px 24px;
      overflow-y: auto;
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
        transition: transform 300ms ease;
      }

      .filter-sidebar.open {
        transform: translateX(0);
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

      .header-left h1 {
        font-size: 20px;
      }

      .planet-count {
        display: none;
      }
    }
  `,
})
export class ExodexPageComponent {
  protected filterState = inject(FilterStateService);
  private apiService = inject(ExoplanetApiService);

  sidebarOpen = this.filterState.sidebarOpen;
  stats = toSignal(this.apiService.getStats$().pipe(startWith(null)));

  onSearch(query: string): void {
    this.filterState.updateFilter('searchQuery', query);
  }
}

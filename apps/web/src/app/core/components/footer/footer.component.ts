import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="exodex-footer">
      <div class="footer-glow"></div>
      <div class="footer-content">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="footer-logo-icon">◈</span>
            <span class="footer-logo-text">Exodex</span>
          </div>
          <nav class="footer-nav">
            <a routerLink="/" class="footer-link">{{ 'footer.home' | translate }}</a>
            <a routerLink="/about" class="footer-link">{{ 'footer.about' | translate }}</a>
            <a href="https://github.com/isma-is-dev" target="_blank" rel="noopener noreferrer" class="footer-link footer-link--external">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </a>
          </nav>
        </div>

        <div class="footer-middle">
          <div class="footer-data-source">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4M10 13h.01" stroke-linecap="round" />
            </svg>
            <span>
              {{ 'footer.dataFrom' | translate }}
              <a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noopener noreferrer" class="nasa-link">
                NASA Exoplanet Archive
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </span>
          </div>
          <div class="footer-inspiration">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
              <path d="M10 2l2.5 5.1 5.5.8-4 3.9.9 5.5L10 14.6l-4.9 2.7.9-5.5-4-3.9 5.5-.8L10 2z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>
              {{ 'footer.inspiredBy' | translate }}
              <a href="https://www.youtube.com/watch?v=9_96HYEGOwA&list=PLOPFAg4mOJ10u1Zy8oFjhr3wqXYqnyKrr" target="_blank" rel="noopener noreferrer" class="qf-link">
                QuantumFracture
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </span>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-made-with">
            {{ 'footer.madeWith' | translate }}
            <span class="heart">💜</span>
            {{ 'footer.by' | translate }}
            <a href="https://github.com/isma-is-dev" target="_blank" rel="noopener noreferrer" class="dev-link">ismaDev</a>
          </div>
          <a href="https://buymeacoffee.com/ismadev" target="_blank" rel="noopener noreferrer" class="donate-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 010 8h-1"/>
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            {{ 'footer.donate' | translate }}
          </a>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .exodex-footer {
      position: relative;
      margin-top: 48px;
      border-top: 1px solid rgba(77, 138, 255, 0.08);
      background: rgba(5, 8, 22, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      z-index: 10;
    }

    .footer-glow {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(77, 138, 255, 0.4), rgba(168, 85, 247, 0.3), transparent);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .footer-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Orbitron', sans-serif;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .footer-logo-icon {
      font-size: 18px;
      background: linear-gradient(135deg, #4d8aff, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 6px rgba(77, 138, 255, 0.4));
    }

    .footer-logo-text {
      background: linear-gradient(135deg, #8892b0 0%, #4d8aff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .footer-nav {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .footer-link {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #5a6177;
      text-decoration: none;
      transition: color 200ms ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .footer-link:hover {
      color: #8892b0;
      text-shadow: none;
    }

    .footer-middle {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      padding: 16px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    .footer-data-source, .footer-inspiration {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #4a5568;
    }

    .nasa-link {
      color: #6da5ff;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: all 200ms ease;
    }

    .nasa-link:hover {
      color: #9ac2ff;
      text-shadow: 0 0 8px rgba(154, 194, 255, 0.3);
    }

    .qf-link {
      color: #c084fc;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: all 200ms ease;
    }

    .qf-link:hover {
      color: #d8b4fe;
      text-shadow: 0 0 8px rgba(216, 180, 254, 0.3);
    }

    .footer-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .footer-made-with {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #4a5568;
    }

    .heart {
      display: inline-block;
      animation: heartBeat 2s ease-in-out infinite;
    }

    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    .dev-link {
      color: #a855f7;
      text-decoration: none;
      font-weight: 600;
      transition: all 200ms ease;
    }

    .dev-link:hover {
      color: #c084fc;
      text-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
    }

    .donate-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 10px;
      text-decoration: none;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .donate-btn:hover {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.4);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      text-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .footer-content {
        padding: 24px 16px 20px;
      }

      .footer-top {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .footer-middle {
        flex-direction: column;
        gap: 12px;
      }

      .footer-bottom {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
    }
  `,
})
export class FooterComponent {}

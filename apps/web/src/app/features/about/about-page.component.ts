import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="about-page">
      <button class="back-btn" routerLink="/">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {{ 'common.backToExodex' | translate }}
      </button>

      <!-- Hero -->
      <section class="about-hero">
        <div class="hero-glow"></div>
        <h1 class="about-title">
          <span class="title-icon">◈</span>
          {{ 'about.title' | translate }}
        </h1>
        <p class="about-subtitle">{{ 'about.subtitle' | translate }}</p>
      </section>

      <!-- What is Exodex -->
      <section class="about-section">
        <h2>
          <span class="section-num">01</span>
          {{ 'about.whatIsTitle' | translate }}
        </h2>
        <p class="section-body">{{ 'about.whatIsBody' | translate }}</p>
      </section>

      <!-- Data Source -->
      <section class="about-section data-section">
        <h2>
          <span class="section-num">02</span>
          {{ 'about.dataSourceTitle' | translate }}
        </h2>
        <div class="data-card">
          <div class="nasa-badge">
            <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
              <circle cx="20" cy="20" r="18" stroke="#4d8aff" stroke-width="1.5" fill="rgba(77,138,255,0.08)"/>
              <circle cx="20" cy="20" r="6" fill="#4d8aff" opacity="0.6"/>
              <ellipse cx="20" cy="20" rx="16" ry="8" stroke="#4d8aff" stroke-width="0.8" opacity="0.4"/>
              <ellipse cx="20" cy="20" rx="8" ry="16" stroke="#4d8aff" stroke-width="0.8" opacity="0.3" transform="rotate(30 20 20)"/>
            </svg>
            <div class="nasa-text">
              <span class="nasa-name">NASA Exoplanet Archive</span>
              <span class="nasa-desc">Caltech / IPAC</span>
            </div>
          </div>
          <p class="section-body">{{ 'about.dataSourceBody' | translate }}</p>
          <a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noopener noreferrer" class="external-link-btn">
            {{ 'about.visitArchive' | translate }}
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </section>

      <!-- Inspiration: QuantumFracture -->
      <section class="about-section">
        <h2>
          <span class="section-num">03</span>
          {{ 'about.inspirationTitle' | translate }}
        </h2>
        <p class="section-body">{{ 'about.inspirationBody' | translate }}</p>

        <div class="video-grid">
          <div class="video-card">
            <div class="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/9_96HYEGOwA?list=PLOPFAg4mOJ10u1Zy8oFjhr3wqXYqnyKrr"
                title="Exoplanetas #1: Cómo Fotografiar un Planeta que Orbita Otra Estrella"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <span class="video-label">{{ 'about.video1' | translate }}</span>
          </div>

          <div class="video-card">
            <div class="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/gj4qh9MTezo?list=PLOPFAg4mOJ10u1Zy8oFjhr3wqXYqnyKrr"
                title="Exoplanetas #2: 3 Maneras de Descubrir un Planeta Nuevo"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <span class="video-label">{{ 'about.video2' | translate }}</span>
          </div>

          <div class="video-card">
            <div class="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/k-NzJxrBdEc?list=PLOPFAg4mOJ10u1Zy8oFjhr3wqXYqnyKrr"
                title="Exoplanetas #3: Por qué Nuestro Sistema Solar es RARO"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <span class="video-label">{{ 'about.video3' | translate }}</span>
          </div>

          <div class="video-card">
            <div class="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/LiNgfK5jXpc?list=PLOPFAg4mOJ10u1Zy8oFjhr3wqXYqnyKrr"
                title="Exoplanetas #4: Por qué Encontrar Planetas Habitables es Imposible"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <span class="video-label">{{ 'about.video4' | translate }}</span>
          </div>

          <div class="video-card">
            <div class="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/QkMgvE5Q_S4?list=PLOPFAg4mOJ10u1Zy8oFjhr3wqXYqnyKrr"
                title="Exoplanetas #5: El Misterio de la Estrella de Tabby"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <span class="video-label">{{ 'about.video5' | translate }}</span>
          </div>
        </div>
      </section>

      <!-- Support -->
      <section class="about-section support-section">
        <h2>
          <span class="section-num">04</span>
          {{ 'about.supportTitle' | translate }}
        </h2>
        <p class="section-body">{{ 'about.supportBody' | translate }}</p>
        <a href="https://buymeacoffee.com/ismadev" target="_blank" rel="noopener noreferrer" class="donate-btn-large">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1"/>
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
          {{ 'about.donateBtn' | translate }}
        </a>
      </section>

      <!-- Credits -->
      <section class="about-section credits-section">
        <h2>
          <span class="section-num">05</span>
          {{ 'about.creditsTitle' | translate }}
        </h2>
        <div class="credits-card">
          <div class="credits-avatar">
            <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
              <rect width="48" height="48" rx="12" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>
              <text x="24" y="30" text-anchor="middle" fill="#a855f7" font-family="Orbitron" font-size="14" font-weight="700">iD</text>
            </svg>
          </div>
          <div class="credits-info">
            <span class="credits-name">ismaDev</span>
            <span class="credits-role">{{ 'about.developer' | translate }}</span>
          </div>
          <a href="https://github.com/isma-is-dev" target="_blank" rel="noopener noreferrer" class="github-btn">
            <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            GitHub
          </a>
        </div>
      </section>
    </div>
  `,
  styles: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes heroGlow {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.1); }
    }

    .about-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px 48px;
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
      -webkit-backdrop-filter: blur(12px);
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

    /* Hero */
    .about-hero {
      position: relative;
      text-align: center;
      margin-bottom: 48px;
      padding: 48px 32px;
      background: rgba(15, 20, 40, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(77, 138, 255, 0.08) 0%, transparent 70%);
      animation: heroGlow 6s ease-in-out infinite;
      pointer-events: none;
    }

    .about-title {
      position: relative;
      font-family: 'Orbitron', sans-serif;
      font-size: 2.4rem;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #e8eeff 0%, #4d8aff 50%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .title-icon {
      font-size: 2.8rem;
      background: linear-gradient(135deg, #4d8aff, #a855f7, #22d3ee);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 10px rgba(77, 138, 255, 0.5));
    }

    .about-subtitle {
      position: relative;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      color: #8892b0;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.7;
    }

    /* Sections */
    .about-section {
      margin-bottom: 32px;
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 28px;
      transition: border-color 300ms ease;
    }

    .about-section:hover {
      border-color: rgba(77, 138, 255, 0.1);
    }

    .about-section h2 {
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
      border-bottom: 1px solid rgba(77, 138, 255, 0.1);
    }

    .section-num {
      font-size: 24px;
      font-weight: 900;
      color: #4d8aff;
      opacity: 0.3;
    }

    .section-body {
      color: #8892b0;
      font-size: 14px;
      line-height: 1.8;
      font-family: 'Inter', sans-serif;
    }

    /* Data Source Card */
    .data-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .nasa-badge {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .nasa-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #4d8aff;
      display: block;
    }

    .nasa-desc {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #5a6177;
    }

    .external-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #4d8aff;
      background: rgba(77, 138, 255, 0.08);
      border: 1px solid rgba(77, 138, 255, 0.2);
      border-radius: 10px;
      text-decoration: none;
      transition: all 300ms ease;
      width: fit-content;
    }

    .external-link-btn:hover {
      background: rgba(77, 138, 255, 0.15);
      border-color: rgba(77, 138, 255, 0.4);
      box-shadow: 0 0 20px rgba(77, 138, 255, 0.15);
      color: #6da5ff;
      text-shadow: none;
    }

    /* Video Grid */
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .video-card {
      background: rgba(10, 14, 28, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 14px;
      overflow: hidden;
      transition: all 300ms ease;
    }

    .video-card:hover {
      border-color: rgba(168, 85, 247, 0.2);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.08);
      transform: translateY(-2px);
    }

    .video-wrapper {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      background: #000;
    }

    .video-wrapper iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    .video-label {
      display: block;
      padding: 12px 14px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #8892b0;
      line-height: 1.4;
    }

    /* Support Section */
    .support-section {
      text-align: center;
    }

    .support-section .section-body {
      max-width: 500px;
      margin: 0 auto 24px;
    }

    .donate-btn-large {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      font-family: 'Orbitron', sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #f59e0b;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 179, 8, 0.08) 100%);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 14px;
      text-decoration: none;
      transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .donate-btn-large:hover {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 179, 8, 0.15) 100%);
      border-color: rgba(245, 158, 11, 0.5);
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.15), 0 8px 20px rgba(0,0,0,0.2);
      color: #fbbf24;
      text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
      transform: translateY(-2px);
    }

    /* Credits */
    .credits-card {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .credits-avatar {
      flex-shrink: 0;
    }

    .credits-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .credits-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #e8eeff;
    }

    .credits-role {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #5a6177;
    }

    .github-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #e8eeff;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      text-decoration: none;
      transition: all 300ms ease;
    }

    .github-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: #fff;
      text-shadow: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .about-page {
        padding: 20px 16px 32px;
      }

      .about-title {
        font-size: 1.6rem;
        flex-direction: column;
        gap: 8px;
      }

      .title-icon {
        font-size: 2rem;
      }

      .video-grid {
        grid-template-columns: 1fr;
      }

      .credits-card {
        flex-wrap: wrap;
      }
    }
  `,
})
export class AboutPageComponent {}

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, Language } from '@exodex/i18n';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="language-switcher">
      <button
        class="lang-btn"
        [class.active]="currentLanguage() === 'es'"
        (click)="setLanguage('es')"
        title="Español"
      >
        ES
      </button>
      <span class="divider">|</span>
      <button
        class="lang-btn"
        [class.active]="currentLanguage() === 'en'"
        (click)="setLanguage('en')"
        title="English"
      >
        EN
      </button>
    </div>
  `,
  styles: `
    .language-switcher {
      display: flex;
      align-items: center;
      gap: 2px;
      background: rgba(15, 20, 40, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 3px;
    }

    .lang-btn {
      padding: 5px 10px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 7px;
      color: #8892b0;
      font-size: 11px;
      font-weight: 700;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 300ms ease;
    }

    .lang-btn:hover {
      color: #e8eeff;
      background: rgba(77, 138, 255, 0.08);
    }

    .lang-btn.active {
      color: #4d8aff;
      border-color: rgba(77, 138, 255, 0.3);
      background: rgba(77, 138, 255, 0.1);
      box-shadow: 0 0 10px rgba(77, 138, 255, 0.15);
      text-shadow: 0 0 6px rgba(77, 138, 255, 0.3);
    }

    .divider {
      color: rgba(77, 138, 255, 0.15);
      font-size: 12px;
    }
  `,
})
export class LanguageSwitcherComponent {
  private languageService = inject(LanguageService);

  currentLanguage = this.languageService.currentLanguage;

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }
}

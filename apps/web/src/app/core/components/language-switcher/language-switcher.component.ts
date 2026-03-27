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
      gap: 4px;
    }

    .lang-btn {
      padding: 4px 8px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 4px;
      color: #8892b0;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .lang-btn:hover {
      color: #f0f4ff;
      background: rgba(255, 255, 255, 0.05);
    }

    .lang-btn.active {
      color: #5e8eff;
      border-color: rgba(94, 142, 255, 0.4);
      background: rgba(94, 142, 255, 0.1);
    }

    .divider {
      color: #4a5568;
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

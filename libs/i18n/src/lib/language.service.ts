import { Injectable, signal, effect, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'es' | 'en';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translate = inject(TranslateService);

  readonly currentLanguage = signal<Language>('es');
  readonly availableLanguages: Language[] = ['es', 'en'];

  constructor() {
    effect(() => {
      const lang = this.currentLanguage();
      this.translate.use(lang);
      localStorage.setItem('exodex-language', lang);
    });

    const saved = localStorage.getItem('exodex-language') as Language | null;
    if (saved && this.availableLanguages.includes(saved)) {
      this.currentLanguage.set(saved);
    } else {
      const browserLang = this.translate.getBrowserLang() as Language;
      if (browserLang && this.availableLanguages.includes(browserLang)) {
        this.currentLanguage.set(browserLang);
      } else {
        this.currentLanguage.set('es');
      }
    }
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
  }

  toggleLanguage(): void {
    const current = this.currentLanguage();
    const next = current === 'es' ? 'en' : 'es';
    this.currentLanguage.set(next);
  }
}

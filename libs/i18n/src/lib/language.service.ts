import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export type Language = 'es' | 'en';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translate = inject(TranslateService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly availableLanguages: Language[] = ['es', 'en'];
  readonly currentLanguage = signal<Language>(this.resolveInitialLang());

  constructor() {
    effect(() => {
      const lang = this.currentLanguage();
      this.translate.use(lang);
      if (this.isBrowser) {
        localStorage.setItem('exodex-language', lang);
      }
    });
  }

  initialize(): Observable<unknown> {
    return this.translate.use(this.currentLanguage());
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
  }

  toggleLanguage(): void {
    const current = this.currentLanguage();
    const next = current === 'es' ? 'en' : 'es';
    this.currentLanguage.set(next);
  }

  private resolveInitialLang(): Language {
    if (!this.isBrowser) return 'es';
    const saved = localStorage.getItem('exodex-language') as Language | null;
    if (saved && this.availableLanguages.includes(saved)) return saved;
    const browserLang = this.translate.getBrowserLang() as Language;
    if (browserLang && this.availableLanguages.includes(browserLang)) return browserLang;
    return 'es';
  }
}

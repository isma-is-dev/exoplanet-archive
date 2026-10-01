import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { PlanetGridComponent } from './planet-grid.component';

/** Returns empty dictionaries so the grid renders the raw translation keys. */
class EmptyTranslateLoader implements TranslateLoader {
  getTranslation(_lang: string): Observable<Record<string, string>> {
    return of({});
  }
}

const planet = (id: string) => ({
  id,
  name: id,
  index: 1,
  hostStar: 'Kepler-186',
  letter: 'f',
  planetType: 'super-earth',
  habitabilityClass: 'marginal',
  discoveryMethod: 'Transit',
  discoveryYear: 2014,
  radiusEarth: 1.17,
  equilibriumTempK: 188,
});

async function flush(): Promise<void> {
  // The grid schedules its result on the async scheduler, so let the pending
  // macrotask run before re-rendering.
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('PlanetGridComponent', () => {
  let fixture: ComponentFixture<PlanetGridComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetGridComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ...TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: EmptyTranslateLoader },
          defaultLanguage: 'en',
        }).providers!,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanetGridComponent);
    http = TestBed.inject(HttpTestingController);
  });

  it('shows a skeleton grid while the request is in flight', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('app-skeleton-card').length).toBeGreaterThan(0);
    expect(element.querySelector('.data-unavailable')).toBeNull();
  });

  it('shows an honest unavailable state when the NASA-backed API fails', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    http.expectOne((req) => req.url.endsWith('/exoplanets')).flush('boom', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    await flush();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.data-unavailable')).not.toBeNull();
    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    // Crucially: no planet cards and no "no planets found" empty state.
    expect(element.querySelector('app-planet-card')).toBeNull();
    expect(element.querySelector('app-empty-state')).toBeNull();
  });

  it('offers a retry that re-queries the API', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    http.expectOne((req) => req.url.endsWith('/exoplanets')).flush('boom', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    await flush();
    fixture.detectChanges();

    const retry: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-unavailable-retry'
    );
    expect(retry).not.toBeNull();

    retry.click();
    await flush();
    fixture.detectChanges();

    // The degraded panel is replaced by the skeleton while retrying…
    expect(fixture.nativeElement.querySelector('.data-unavailable')).toBeNull();

    // …and the recovered response renders real planets.
    http.expectOne((req) => req.url.endsWith('/exoplanets')).flush({
      data: [planet('kepler-186-f')],
      total: 1,
      page: 1,
      pageSize: 48,
      totalPages: 1,
    });
    await flush();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-planet-card')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.data-unavailable')).toBeNull();
  });

  it('renders the empty state when the API answers with no matching planets', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    http.expectOne((req) => req.url.endsWith('/exoplanets')).flush({
      data: [],
      total: 0,
      page: 1,
      pageSize: 48,
      totalPages: 0,
    });
    await flush();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-empty-state')).not.toBeNull();
    expect(element.querySelector('.data-unavailable')).toBeNull();
  });
});

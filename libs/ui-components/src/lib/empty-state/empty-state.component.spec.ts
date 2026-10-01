import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { EmptyStateComponent } from './empty-state.component';

class EmptyTranslateLoader implements TranslateLoader {
  getTranslation(_lang: string): Observable<Record<string, string>> {
    return of({});
  }
}

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [
        ...TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: EmptyTranslateLoader },
          defaultLanguage: 'en',
        }).providers!,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
  });

  it('tells the user that no planets matched, not that the data is missing', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('emptyState.title');
    expect(text).toContain('emptyState.message');
  });

  it('offers a way out of the empty state', () => {
    const emitted: void[] = [];
    fixture.componentInstance.clearFilters.subscribe(() => emitted.push(undefined));

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.empty-action');
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('common.clearFilters');

    button.click();
    expect(emitted.length).toBe(1);
  });
});

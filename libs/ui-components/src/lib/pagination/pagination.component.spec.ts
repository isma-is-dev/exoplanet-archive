import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

function render(currentPage: number, totalPages: number) {
  const fixture: ComponentFixture<PaginationComponent> =
    TestBed.createComponent(PaginationComponent);
  fixture.componentRef.setInput('currentPage', currentPage);
  fixture.componentRef.setInput('totalPages', totalPages);
  fixture.detectChanges();
  return fixture;
}

describe('PaginationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationComponent] }).compileComponents();
  });

  it('renders nothing at all for a single page', () => {
    const fixture = render(1, 1);
    expect(fixture.nativeElement.querySelector('.pagination')).toBeNull();
  });

  it('lists every page when there are few enough', () => {
    const fixture = render(3, 7);
    expect(fixture.componentInstance.visiblePages()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses the middle of a long list behind an ellipsis', () => {
    const fixture = render(10, 20);
    const pages = fixture.componentInstance.visiblePages();

    expect(pages).toEqual([1, -1, 9, 10, 11, -1, 20]);
    expect(fixture.nativeElement.querySelectorAll('.ellipsis').length).toBe(2);
  });

  it('drops the leading ellipsis when the user is near the start', () => {
    const fixture = render(3, 20);
    expect(fixture.componentInstance.visiblePages()).toEqual([1, 2, 3, 4, -1, 20]);
  });

  it('drops the trailing ellipsis when the user is near the end', () => {
    const fixture = render(19, 20);
    expect(fixture.componentInstance.visiblePages()).toEqual([1, -1, 18, 19, 20]);
  });

  it('keeps the first and last page reachable at every position', () => {
    for (let current = 1; current <= 20; current++) {
      const pages = render(current, 20).componentInstance.visiblePages();
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(20);
      expect(pages).toContain(current);
    }
  });

  it('marks the current page as active', () => {
    const fixture = render(3, 5);
    const active = fixture.nativeElement.querySelectorAll('.page-btn.active');
    expect(active.length).toBe(1);
    expect(active[0].textContent.trim()).toBe('3');
  });

  it('disables the previous button on the first page and the next button on the last', () => {
    const first = render(1, 5).nativeElement;
    expect(first.querySelectorAll('.nav-btn')[0].disabled).toBe(true);
    expect(first.querySelectorAll('.nav-btn')[1].disabled).toBe(false);

    const last = render(5, 5).nativeElement;
    expect(last.querySelectorAll('.nav-btn')[0].disabled).toBe(false);
    expect(last.querySelectorAll('.nav-btn')[1].disabled).toBe(true);
  });

  it('emits the requested page when a number is clicked', () => {
    const fixture = render(1, 5);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    // Exclude the two navigation arrows so the index is the page number.
    const numbers = fixture.nativeElement.querySelectorAll('.page-btn:not(.nav-btn)');
    numbers[2].click(); // page 3

    expect(emitted).toEqual([3]);
  });

  it('emits through the navigation arrows', () => {
    const fixture = render(3, 5);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    const arrows = fixture.nativeElement.querySelectorAll('.nav-btn');
    arrows[0].click();
    arrows[1].click();

    expect(emitted).toEqual([2, 4]);
  });

  it('refuses to emit a page outside the available range', () => {
    const fixture = render(1, 3);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    fixture.componentInstance.goToPage(0);
    fixture.componentInstance.goToPage(4);
    expect(emitted).toEqual([]);

    fixture.componentInstance.goToPage(3);
    expect(emitted).toEqual([3]);
  });
});

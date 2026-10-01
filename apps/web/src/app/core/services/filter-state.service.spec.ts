import { TestBed } from '@angular/core/testing';
import { FilterStateService } from './filter-state.service';

function makeService(): FilterStateService {
  TestBed.configureTestingModule({});
  return TestBed.inject(FilterStateService);
}

describe('FilterStateService', () => {
  it('starts from the documented defaults', () => {
    const service = makeService();

    expect(service.filters().searchQuery).toBe('');
    expect(service.filters().planetTypes).toEqual([]);
    expect(service.filters().discoveryYearRange).toBeNull();
    expect(service.sort()).toEqual({ field: 'index', direction: 'asc' });
    expect(service.page()).toBe(1);
    expect(service.pageSize()).toBe(48);
    expect(service.viewMode()).toBe('grid');
    expect(service.hasActiveFilters()).toBe(false);
    expect(service.activeFilterCount()).toBe(0);
  });

  it('counts each active filter group once', () => {
    const service = makeService();

    service.updateFilter('planetTypes', ['jovian', 'neptunian']);
    expect(service.activeFilterCount()).toBe(1);

    service.updateFilter('discoveryMethods', ['Transit']);
    service.updateFilter('searchQuery', 'kepler');
    expect(service.activeFilterCount()).toBe(3);
    expect(service.hasActiveFilters()).toBe(true);
  });

  it('ignores a blank search query', () => {
    const service = makeService();
    service.updateFilter('searchQuery', '   ');
    expect(service.activeFilterCount()).toBe(0);
  });

  it('resets to page 1 whenever a filter changes', () => {
    const service = makeService();
    service.setPage(7);
    expect(service.page()).toBe(7);

    service.updateFilter('searchQuery', 'kepler');
    // The reset happens in an effect, so let change detection run.
    TestBed.tick();
    expect(service.page()).toBe(1);
  });

  it('resets to page 1 when the sort changes', () => {
    const service = makeService();
    service.setPage(4);

    service.setSort('radiusEarth', 'desc');
    TestBed.tick();
    expect(service.page()).toBe(1);
  });

  it('never lets the page fall below one', () => {
    const service = makeService();
    service.setPage(-3);
    expect(service.page()).toBe(1);
  });

  it('walks forwards and backwards with next/prev', () => {
    const service = makeService();
    service.nextPage();
    service.nextPage();
    expect(service.page()).toBe(3);

    service.prevPage();
    expect(service.page()).toBe(2);

    service.setPage(1);
    service.prevPage();
    expect(service.page()).toBe(1);
  });

  it('flips the direction when the same field is sorted again', () => {
    const service = makeService();

    service.toggleSort('radiusEarth');
    expect(service.sort()).toEqual({ field: 'radiusEarth', direction: 'asc' });

    service.toggleSort('radiusEarth');
    expect(service.sort()).toEqual({ field: 'radiusEarth', direction: 'desc' });
  });

  it('starts a new sort ascending when the field changes', () => {
    const service = makeService();
    service.toggleSort('radiusEarth');
    service.toggleSort('radiusEarth');

    service.toggleSort('massEarth');
    expect(service.sort()).toEqual({ field: 'massEarth', direction: 'asc' });
  });

  it('replaces the filter object instead of mutating it', () => {
    const service = makeService();
    const before = service.filters();

    service.updateFilter('searchQuery', 'kepler');
    expect(service.filters()).not.toBe(before);
    expect(before.searchQuery).toBe('');
  });

  it('resets every filter on resetFilters', () => {
    const service = makeService();
    service.updateFilter('searchQuery', 'kepler');
    service.updateFilter('planetTypes', ['jovian']);

    service.resetFilters();
    expect(service.hasActiveFilters()).toBe(false);
    expect(service.filters().searchQuery).toBe('');
  });

  it('toggles the view mode and the sidebar', () => {
    const service = makeService();

    service.toggleViewMode();
    expect(service.viewMode()).toBe('list');
    service.toggleViewMode();
    expect(service.viewMode()).toBe('grid');

    expect(service.sidebarOpen()).toBe(false);
    service.toggleSidebar();
    expect(service.sidebarOpen()).toBe(true);
  });
});

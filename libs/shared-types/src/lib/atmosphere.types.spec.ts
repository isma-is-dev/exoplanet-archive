import { ATMOSPHERE_DATABASE } from './atmosphere.types';

const entries = Object.entries(ATMOSPHERE_DATABASE);
const NORMALISED_ID = /^[a-z0-9-]+$/;

describe('ATMOSPHERE_DATABASE', () => {
  it('is not empty', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it('keys every entry by its own planetId', () => {
    for (const [key, data] of entries) {
      expect(data.planetId).toBe(key);
    }
  });

  it('uses planet ids in the same normalised slug form the API produces', () => {
    // The API builds ids with `name.toLowerCase().replace(/\s+/g, '-')`, so a
    // key with spaces or capitals would silently never match a lookup.
    for (const [key] of entries) {
      expect(key).toMatch(NORMALISED_ID);
    }
  });

  it('records at least one detected element for every entry', () => {
    for (const [key, data] of entries) {
      expect(data.elements.length).toBeGreaterThan(0);
      expect(`${key}: ${data.elements.length} elements`).toBeTruthy();
    }
  });

  it('uses plausible spectral wavelengths and band widths', () => {
    for (const [key, data] of entries) {
      for (const element of data.elements) {
        expect(element.wavelengthNm).toBeGreaterThan(0);
        expect(element.wavelengthNm).toBeLessThan(100_000);
        expect(element.bandWidthNm).toBeGreaterThan(0);
        expect(element.bandWidthNm).toBeLessThanOrEqual(element.wavelengthNm);
        expect(`${key} ${element.symbol}`).toBeTruthy();
      }
    }
  });

  it('marks every detection as confirmed or tentative, and nothing else', () => {
    for (const [, data] of entries) {
      for (const element of data.elements) {
        expect(['confirmed', 'tentative']).toContain(element.confidence);
      }
    }
  });

  it('uses a display colour for every element', () => {
    for (const [, data] of entries) {
      for (const element of data.elements) {
        expect(element.color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('records the telescope and year of every detection', () => {
    for (const [key, data] of entries) {
      expect(data.telescope.length).toBeGreaterThan(0);
      expect(data.year).toBeGreaterThan(1990);
      expect(data.year).toBeLessThanOrEqual(new Date().getFullYear());
      expect(`${key} ${data.notes.length} chars`).toBeTruthy();
    }
  });

  it('does not list the same molecule twice for one planet', () => {
    for (const [key, data] of entries) {
      const symbols = data.elements.map((e) => e.symbol);
      expect(new Set(symbols).size).toBe(symbols.length);
      expect(key).toBeTruthy();
    }
  });
});

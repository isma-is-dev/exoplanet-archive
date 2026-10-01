import { PlanetRenderParams } from '@exodex/shared-types';
import { renderPlanet } from './planet-renderer';

const params = (overrides: Partial<PlanetRenderParams> = {}): PlanetRenderParams => ({
  radiusEarth: 1,
  massEarth: 1,
  equilibriumTempK: 255,
  planetType: 'rocky-terrestrial',
  densityGCC: 5.5,
  eccentricity: 0,
  insolationFlux: 1,
  discoveryYear: 2014,
  orbitalPeriodDays: 129.9,
  size: 'card',
  animationsEnabled: true,
  ...overrides,
});

describe('renderPlanet', () => {
  it('returns a complete svg document with the viewBox of the render size', () => {
    const { svgString } = renderPlanet(params(), 'Kepler-186 f');
    expect(svgString).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svgString).toContain('viewBox="0 0 160 160"');
    expect(svgString.endsWith('</svg>')).toBe(true);
  });

  it('uses the size-appropriate viewBox for each render size', () => {
    expect(renderPlanet(params({ size: 'micro' }), 'X').svgString).toContain(
      'viewBox="0 0 32 32"'
    );
    expect(renderPlanet(params({ size: 'detail' }), 'X').svgString).toContain(
      'viewBox="0 0 320 320"'
    );
  });

  it('is deterministic for the same planet so SSR and hydration agree', () => {
    const first = renderPlanet(params(), 'Kepler-186 f');
    const second = renderPlanet(params(), 'Kepler-186 f');
    expect(first.svgString).toBe(second.svgString);
    expect(first.primaryColor).toBe(second.primaryColor);
  });

  it('derives gradient ids from the planet name, not a random value', () => {
    const a = renderPlanet(params(), 'Kepler-186 f');
    const b = renderPlanet(params(), 'Kepler-186 f');
    const c = renderPlanet(params(), 'GJ 1214 b');

    const ids = (svg: string) => [...svg.matchAll(/id="(body-[^"]+)"/g)].map((m) => m[1]);
    expect(ids(a.svgString)).toEqual(ids(b.svgString));
    expect(ids(a.svgString)).not.toEqual(ids(c.svgString));
  });

  it('exposes the palette colours it actually rendered', () => {
    const result = renderPlanet(params({ planetType: 'jovian' }), 'HD 209458 b');
    expect(result.primaryColor).toBe('#C4956A');
    expect(result.secondaryColor).toBe('#A07848');
    expect(result.svgString).toContain(result.primaryColor);
    expect(result.svgString).toContain(result.secondaryColor);
  });

  it('draws rings only for large ring-bearing giants', () => {
    expect(renderPlanet(params({ planetType: 'jovian', radiusEarth: 11 }), 'J').svgString).toContain('ring-front');
    expect(renderPlanet(params({ planetType: 'rocky-terrestrial', radiusEarth: 1 }), 'E').svgString).not.toContain('ring-front');
  });

  it('draws the back half of the rings before the planet body and the front half after', () => {
    const svg = renderPlanet(params({ planetType: 'jovian', radiusEarth: 11 }), 'J').svgString;
    expect(svg.indexOf('ring-back')).toBeLessThan(svg.indexOf('body-'));
    expect(svg.indexOf('ring-front')).toBeGreaterThan(svg.indexOf('body-'));
  });

  it('omits the atmosphere layer when neither temperature nor flux is known', () => {
    const svg = renderPlanet(
      params({ equilibriumTempK: null, insolationFlux: null }),
      'Unknown world'
    ).svgString;
    expect(svg).not.toContain('atm-');
  });

  it('animates card and detail renders but never the micro render', () => {
    expect(renderPlanet(params({ size: 'card' }), 'A').svgString).toContain('<animate');
    expect(renderPlanet(params({ size: 'detail' }), 'A').svgString).toContain('<animate');
    expect(renderPlanet(params({ size: 'micro' }), 'A').svgString).not.toContain('<animate');
  });

  it('emits no animation when animations are disabled', () => {
    expect(
      renderPlanet(params({ animationsEnabled: false }), 'A').svgString
    ).not.toContain('<animate');
  });

  it('renders without crashing for a completely unknown planet', () => {
    const result = renderPlanet(
      params({
        radiusEarth: null,
        massEarth: null,
        equilibriumTempK: null,
        insolationFlux: null,
        densityGCC: null,
        discoveryYear: null,
        eccentricity: null,
        orbitalPeriodDays: null,
        planetType: 'unknown',
      }),
      ''
    );
    expect(result.svgString).toContain('<svg');
  });

  it('describes the planet size and temperature in words', () => {
    expect(renderPlanet(params({ radiusEarth: 1, equilibriumTempK: 255 }), 'E').description).toBe(
      'planeta rocoso terrestre pequeño, frío'
    );
    expect(renderPlanet(params({ radiusEarth: 1, equilibriumTempK: 350 }), 'E').description).toBe(
      'planeta rocoso terrestre pequeño, templado'
    );
    expect(
      renderPlanet(params({ radiusEarth: null, equilibriumTempK: null, planetType: 'unknown' }), 'X')
        .description
    ).toBe('planeta de tipo desconocido de tamaño desconocido, de temperatura desconocida');
  });
});

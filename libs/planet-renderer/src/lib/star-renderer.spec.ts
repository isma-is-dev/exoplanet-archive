import { StarRenderParams } from '@exodex/shared-types';
import { renderStar } from './star-renderer';

const params = (overrides: Partial<StarRenderParams> = {}): StarRenderParams => ({
  stellarTempK: 5778,
  stellarRadiusSun: 1,
  stellarMassSun: 1,
  numberOfStarsInSystem: 1,
  size: 'card',
  animationsEnabled: true,
  ...overrides,
});

describe('renderStar', () => {
  it('returns a complete svg document with the viewBox of the render size', () => {
    const { svgString } = renderStar(params(), 'Sun');
    expect(svgString).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svgString).toContain('viewBox="0 0 160 160"');
    expect(svgString.endsWith('</svg>')).toBe(true);
  });

  it('is deterministic for the same star and temperature', () => {
    // The ids are hashed from the star name so SSR output matches the client.
    expect(renderStar(params(), 'Alpha Cen A').svgString).toBe(
      renderStar(params(), 'Alpha Cen A').svgString
    );
    expect(renderStar(params(), 'Alpha Cen A').svgString).not.toBe(
      renderStar(params(), 'Alpha Cen B').svgString
    );
  });

  it('reports the spectral class and primary colour it rendered', () => {
    const result = renderStar(params({ stellarTempK: 3000 }), 'Proxima Centauri');
    expect(result.spectralClass).toBe('M');
    expect(result.primaryColor).toBe('#ff5b4f');
    expect(result.svgString).toContain('#ff5b4f');
  });

  it('falls back to a Sun-like render for an unknown temperature', () => {
    const result = renderStar(params({ stellarTempK: null }), 'Unknown');
    expect(result.spectralClass).toBe('G');
  });

  it('skips the corona and flares for the micro render', () => {
    const micro = renderStar(params({ size: 'micro' }), 'Sun').svgString;
    const card = renderStar(params({ size: 'card' }), 'Sun').svgString;

    expect(card).toContain('star-corona');
    expect(micro).not.toContain('star-corona');
    expect(micro).toContain('star-core');
  });

  it('emits animation nodes only when animations are enabled', () => {
    expect(renderStar(params({ animationsEnabled: false }), 'Sun').svgString).not.toContain(
      '<animate'
    );
    expect(renderStar(params({ animationsEnabled: true }), 'Sun').svgString).toContain(
      '<animate'
    );
  });

  it('renders one companion star per extra star in the system', () => {
    const single = renderStar(params({ numberOfStarsInSystem: 1 }), 'Sun').svgString;
    const triple = renderStar(params({ numberOfStarsInSystem: 3 }), 'Sun').svgString;

    const coreIds = (svg: string) =>
      [...svg.matchAll(/id="(star-core-[^"]+)"/g)].map((m) => m[1]);
    expect(coreIds(single)).toHaveLength(1);
    expect(coreIds(triple)).toHaveLength(3);
  });

  it('omits companions for the micro render even in a multiple system', () => {
    const svg = renderStar(params({ size: 'micro', numberOfStarsInSystem: 4 }), 'Sun').svgString;
    expect([...svg.matchAll(/id="(star-core-[^"]+)"/g)]).toHaveLength(1);
  });

  it('uses the radius to size the disc, clamped inside the viewBox', () => {
    const small = renderStar(params({ stellarRadiusSun: 0.1 }), 'Dwarf').svgString;
    const large = renderStar(params({ stellarRadiusSun: 20 }), 'Giant').svgString;

    const coreRadius = (svg: string) => Number(svg.match(/<circle cx="80" cy="80" r="([\d.]+)" fill="url\(#star-core/)?.[1]);
    expect(coreRadius(large)).toBeGreaterThan(coreRadius(small));
    expect(coreRadius(large)).toBeLessThanOrEqual(160 * 0.45);
  });

  it('treats a null radius as Sun-sized', () => {
    expect(renderStar(params({ stellarRadiusSun: null }), 'X').svgString).toBe(
      renderStar(params({ stellarRadiusSun: 1 }), 'X').svgString
    );
  });
});

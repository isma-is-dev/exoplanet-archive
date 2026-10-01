import { getStarColors, getStarVisualRadius } from './star.algorithm';
import { getViewBoxSize } from './size.algorithm';

describe('getStarColors', () => {
  it('defaults to a Sun-like G star when the temperature is unknown', () => {
    const colors = getStarColors(null);
    expect(colors.spectralClass).toBe('G');
    expect(colors.primary).toBe(getStarColors(5778).primary);
  });

  it('classifies the blackbody sequence from cool red to hot blue', () => {
    expect(getStarColors(3000).spectralClass).toBe('M');
    expect(getStarColors(4500).spectralClass).toBe('K');
    expect(getStarColors(5500).spectralClass).toBe('G');
    expect(getStarColors(7000).spectralClass).toBe('F');
    expect(getStarColors(9000).spectralClass).toBe('A');
    expect(getStarColors(15000).spectralClass).toBe('B');
    expect(getStarColors(40000).spectralClass).toBe('O');
  });

  it('places each class boundary on the documented side', () => {
    expect(getStarColors(3500).spectralClass).toBe('K');
    expect(getStarColors(5000).spectralClass).toBe('G');
    expect(getStarColors(6000).spectralClass).toBe('F');
    expect(getStarColors(7500).spectralClass).toBe('A');
    expect(getStarColors(10000).spectralClass).toBe('B');
    expect(getStarColors(30000).spectralClass).toBe('O');
  });

  it('always renders a white core and a glow equal to the primary colour', () => {
    const colors = getStarColors(6200);
    expect(colors.core).toBe('#ffffff');
    expect(colors.glow).toBe(colors.primary);
  });

  it('darkens the secondary for cool stars and lightens it for hot ones', () => {
    // A cold star is already dark, so the secondary must be darker still.
    expect(getStarColors(3000).secondary).toBe('#e65247');
    // A hot star is already white, so the secondary is nudged lighter.
    expect(getStarColors(15000).secondary).toBe('#dae8ff');
  });
});

describe('getStarVisualRadius', () => {
  it('renders a Sun-sized star at 25% of the viewBox', () => {
    for (const size of ['micro', 'card', 'detail'] as const) {
      expect(getStarVisualRadius(1, size)).toBeCloseTo(getViewBoxSize(size) * 0.25, 5);
    }
  });

  it('treats a null radius as Sun-sized', () => {
    expect(getStarVisualRadius(null, 'card')).toBe(
      getStarVisualRadius(1, 'card')
    );
  });

  it('grows sub-giants and shrinks red dwarfs', () => {
    expect(getStarVisualRadius(1.5, 'card')).toBeGreaterThan(
      getStarVisualRadius(1, 'card')
    );
    expect(getStarVisualRadius(0.2, 'card')).toBeLessThan(
      getStarVisualRadius(1, 'card')
    );
  });

  it('never overflows the viewBox, even for a supergiant', () => {
    const max = getViewBoxSize('detail') * 0.45;
    expect(getStarVisualRadius(500, 'detail')).toBeLessThanOrEqual(max);
  });

  it('never collapses a star to nothing', () => {
    const min = getViewBoxSize('card') * 0.1;
    expect(getStarVisualRadius(0.0001, 'card')).toBeGreaterThanOrEqual(min);
  });
});

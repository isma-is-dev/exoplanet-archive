import { getPlanetVisualRadius, getViewBoxSize, getSvgSize } from './size.algorithm';

describe('getViewBoxSize / getSvgSize', () => {
  it('gives each render size its own coordinate system', () => {
    expect(getViewBoxSize('micro')).toBe(32);
    expect(getViewBoxSize('card')).toBe(160);
    expect(getViewBoxSize('detail')).toBe(320);
  });

  it('keeps the rendered svg smaller than the viewBox for cards', () => {
    expect(getSvgSize('micro')).toBeLessThanOrEqual(getViewBoxSize('micro'));
    expect(getSvgSize('card')).toBeLessThanOrEqual(getViewBoxSize('card'));
    expect(getSvgSize('detail')).toBe(getViewBoxSize('detail'));
  });
});

describe('getPlanetVisualRadius', () => {
  it('shrinks an unknown-radius planet below the base radius', () => {
    expect(getPlanetVisualRadius(null, 'card')).toBeCloseTo(48 * 0.7, 5);
  });

  it('scales with a logarithmic law and grows with the real radius', () => {
    const earth = getPlanetVisualRadius(1, 'card');
    const mars = getPlanetVisualRadius(0.53, 'card');
    const jupiter = getPlanetVisualRadius(11.2, 'card');

    expect(mars).toBeLessThan(earth);
    expect(jupiter).toBeGreaterThan(earth);
  });

  it('keeps the visual radius inside the documented 0.25–1.8 scale band', () => {
    // A body far larger than Jupiter must stay at the upper bound…
    expect(getPlanetVisualRadius(1000, 'card')).toBeCloseTo(48 * 1.8, 5);
    // …and a sub-Mercury body at the lower bound.
    expect(getPlanetVisualRadius(0.0001, 'card')).toBeCloseTo(48 * 0.25, 5);
  });

  it('scales the same planet proportionally across render sizes', () => {
    const card = getPlanetVisualRadius(2, 'card');
    const detail = getPlanetVisualRadius(2, 'detail');
    expect(detail / card).toBeCloseTo(128 / 48, 5);
  });
});

import {
  getPlanetColors,
  lightenHex,
  darkenHex,
  desaturateHex,
  mixHex,
  getComplementaryColor,
} from './color.algorithm';

describe('color utilities', () => {
  it('lightens towards white without exceeding the channel range', () => {
    expect(lightenHex('#000000', 1)).toBe('#ffffff');
    expect(lightenHex('#000000', 0)).toBe('#000000');
    expect(lightenHex('#808080', 0.5)).toBe('#c0c0c0');
  });

  it('darkens towards black without going below zero', () => {
    expect(darkenHex('#ffffff', 1)).toBe('#000000');
    expect(darkenHex('#ffffff', 0)).toBe('#ffffff');
    expect(darkenHex('#808080', 0.5)).toBe('#404040');
  });

  it('desaturates a saturated colour towards its luminance', () => {
    // Pure red has luminance 0.299*255 ≈ 76, so full desaturation is a grey.
    expect(desaturateHex('#ff0000', 1)).toBe('#4c4c4c');
    // factor 0 is a no-op
    expect(desaturateHex('#ff0000', 0)).toBe('#ff0000');
  });

  it('mixes two colours by the interpolation factor', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('computes the channel-wise complementary colour', () => {
    expect(getComplementaryColor('#000000')).toBe('#ffffff');
    expect(getComplementaryColor('#ffffff')).toBe('#000000');
    expect(getComplementaryColor('#4d8aff')).toBe('#b27500');
  });

  it('always returns a lowercase 6-digit hex string', () => {
    for (const value of [lightenHex('#123456', 0.3), darkenHex('#123456', 0.3), desaturateHex('#123456', 0.3), mixHex('#123456', '#abcdef', 0.3)]) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('getPlanetColors', () => {
  const everyKey = (c: ReturnType<typeof getPlanetColors>) =>
    Object.keys(c).sort();

  it('always returns the four palette slots', () => {
    expect(everyKey(getPlanetColors('rocky-terrestrial', 250))).toEqual([
      'accent',
      'primary',
      'secondary',
      'tertiary',
    ]);
  });

  it('returns incandescent palettes above 1200K even for a rocky type', () => {
    const hot = getPlanetColors('rocky-terrestrial', 1500);
    expect(hot.primary).toBe('#A23520');
  });

  it('distinguishes ultra-hot (>2000K) from hot giants', () => {
    expect(getPlanetColors('hot-jupiter', 2500).primary).toBe('#D4582A');
    expect(getPlanetColors('hot-jupiter', 1500).primary).toBe('#A23520');
  });

  it('uses a fixed Jupiter-like palette for jovian regardless of temperature', () => {
    expect(getPlanetColors('jovian', 80).primary).toBe('#C4956A');
    expect(getPlanetColors('jovian', 900).primary).toBe('#C4956A');
  });

  it('picks the ice-blue neptunian palette below 200K', () => {
    expect(getPlanetColors('neptunian', 50).primary).toBe('#4A78B4');
  });

  it('picks the temperate neptunian palette between 200K and 500K', () => {
    expect(getPlanetColors('neptunian', 300).primary).toBe('#3E5A90');
  });

  it('falls back to a neutral grey palette for unknown planets', () => {
    expect(getPlanetColors('unknown', 300).primary).toBe('#787878');
  });

  it('treats a null temperature as the temperate branch, not a crash', () => {
    expect(getPlanetColors('super-earth', null).primary).toBe('#B4784A');
  });
});

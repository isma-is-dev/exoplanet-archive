import { buildAtmosphereGlow } from './atmosphere.algorithm';

describe('buildAtmosphereGlow', () => {
  const radius = 40;
  const center = 60;
  const color = '#6a8458';

  it('renders nothing when neither temperature nor flux is known', () => {
    expect(buildAtmosphereGlow(radius, center, color, null, null)).toBe('');
  });

  it('renders a glow from the insolation flux alone', () => {
    const svg = buildAtmosphereGlow(radius, center, color, null, 1.1);
    expect(svg).toContain('<radialGradient');
    expect(svg).toContain('<circle');
  });

  it('builds three layers: outer glow, inner glow and a Fresnel rim', () => {
    const svg = buildAtmosphereGlow(radius, center, color, 255, 1);
    expect(svg.match(/<radialGradient /g)).toHaveLength(3);
    expect(svg.match(/<circle /g)).toHaveLength(3);
    expect(svg).toContain('rim');
  });

  it('uses an incandescent orange glow above 1000K', () => {
    expect(buildAtmosphereGlow(radius, center, color, 1500, 1)).toContain('#FF5020');
  });

  it('uses a warm orange glow between 700K and 1000K', () => {
    expect(buildAtmosphereGlow(radius, center, color, 800, 1)).toContain('#E87040');
  });

  it('uses a cool blue glow below 150K', () => {
    expect(buildAtmosphereGlow(radius, center, color, 100, 1)).toContain('#88B8E0');
  });

  it('keeps the planet colour for temperate worlds', () => {
    // 255K sits in the default band, which derives the rim from the surface.
    expect(buildAtmosphereGlow(radius, center, color, 255, 1)).toContain(color);
  });

  it('emits no animation nodes unless animation is requested', () => {
    expect(buildAtmosphereGlow(radius, center, color, 255, 1)).not.toContain('<animate');
    expect(
      buildAtmosphereGlow(radius, center, color, 255, 1, true)
    ).toContain('<animate');
  });

  it('scales the glow radii from the planet radius and uses unique ids', () => {
    const first = buildAtmosphereGlow(radius, center, color, 255, 1);
    const second = buildAtmosphereGlow(radius, center, color, 255, 1);

    expect(first).toContain(`r="${radius * 1.18}"`);
    expect(first).toContain(`r="${radius * 1.08}"`);
    // Deterministic ids: the same planet always yields the same markup.
    expect(first).toBe(second);
    expect(first).toMatch(/id="atm-[a-z0-9]+-outer"/);
  });

  it('uses the caller-supplied suffix so two planets on a page never collide', () => {
    expect(buildAtmosphereGlow(radius, center, color, 255, 1, false, 'kepler186f')).toContain(
      'id="atm-kepler186f-outer"'
    );
    expect(
      buildAtmosphereGlow(radius, center, color, 255, 1, false, 'kepler186f')
    ).not.toBe(buildAtmosphereGlow(radius, center, color, 255, 1, false, 'gj1214b'));
  });
});

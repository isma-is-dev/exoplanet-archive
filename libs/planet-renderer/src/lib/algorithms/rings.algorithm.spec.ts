import { shouldShowRings, buildRings, buildFrontRings } from './rings.algorithm';

const countMatches = (svg: string, pattern: RegExp) => svg.match(pattern)?.length ?? 0;

describe('shouldShowRings', () => {
  it('shows rings for the large ring-bearing giants', () => {
    expect(shouldShowRings('jovian', 11)).toBe(true);
    expect(shouldShowRings('neptunian', 8)).toBe(true);
    expect(shouldShowRings('cold-giant', 9)).toBe(true);
  });

  it('never shows rings for small or terrestrial bodies', () => {
    expect(shouldShowRings('rocky-terrestrial', 1)).toBe(false);
    expect(shouldShowRings('super-earth', 2)).toBe(false);
    expect(shouldShowRings('mini-neptune', 3)).toBe(false);
    expect(shouldShowRings('jovian', 4)).toBe(false);
  });

  it('needs a known radius above the 7 R⊕ threshold', () => {
    expect(shouldShowRings('jovian', null)).toBe(false);
    expect(shouldShowRings('jovian', 7)).toBe(false);
    expect(shouldShowRings('jovian', 7.01)).toBe(true);
  });
});

describe('ring geometry', () => {
  const radius = 40;
  const center = 60;
  const secondary = '#a07848';

  it('renders three band ellipses for the back rings', () => {
    const svg = buildRings(radius, center, secondary);
    expect(countMatches(svg, /<ellipse /g)).toBe(3);
  });

  it('renders three band ellipses for the front rings', () => {
    const svg = buildFrontRings(radius, center, secondary);
    expect(countMatches(svg, /<ellipse /g)).toBe(3);
  });

  it('tilts both halves by the same angle so the split follows the ring axis', () => {
    const rotations = [
      ...buildRings(radius, center, secondary).matchAll(/rotate\((-?[\d.]+)/g),
      ...buildFrontRings(radius, center, secondary).matchAll(/rotate\((-?[\d.]+)/g),
    ].map((m) => m[1]);

    expect(rotations.length).toBe(4);
    expect(new Set(rotations).size).toBe(1);
    expect(rotations[0]).toBe('-15');
  });

  it('clips the back half above the centre and the front half below it', () => {
    // Back rings are revealed by a rect that starts at the top; front rings by
    // one that starts at the centre line, so the planet body is never cut into.
    const backRect = buildRings(radius, center, secondary).match(
      /<rect x="[^"]*" y="([^"]*)"/
    );
    const frontRect = buildFrontRings(radius, center, secondary).match(
      /<rect x="[^"]*" y="([^"]*)"/
    );

    expect(backRect?.[1]).toBe(`-${center * 2}`);
    expect(frontRect?.[1]).toBe(`${center}`);
  });

  it('produces a stable clip id for the same planet', () => {
    // Deterministic ids keep server-rendered markup identical to the client.
    expect(buildRings(radius, center, secondary)).toBe(buildRings(radius, center, secondary));
  });

  it('keeps the back and front halves on different clip paths', () => {
    const back = buildRings(radius, center, secondary).match(/id="(ring-back-[^"]+)"/);
    const front = buildFrontRings(radius, center, secondary).match(/id="(ring-front-[^"]+)"/);

    expect(back?.[1]).toBeDefined();
    expect(front?.[1]).toBeDefined();
    expect(back?.[1]).not.toBe(front?.[1]);
  });

  it('uses the caller-supplied suffix so two planets on a page never collide', () => {
    const a = buildRings(radius, center, secondary, 'kepler186f');
    const b = buildRings(radius, center, secondary, 'gj1214b');
    expect(a).toContain('id="ring-back-kepler186f"');
    expect(b).toContain('id="ring-back-gj1214b"');
    expect(a).not.toBe(b);
  });

  it('derives band radii from the planet radius, staying outside the body', () => {
    const svg = buildRings(radius, center, secondary);
    const midRadii = [...svg.matchAll(/rx="([\d.]+)"/g)].map((m) => Number(m[1]));

    expect(midRadii).toHaveLength(3);
    for (const midRadius of midRadii) {
      expect(midRadius).toBeGreaterThan(radius);
    }
    // Bands are ordered outwards and never overlap.
    expect([...midRadii].sort((a, b) => a - b)).toEqual(midRadii);
  });
});

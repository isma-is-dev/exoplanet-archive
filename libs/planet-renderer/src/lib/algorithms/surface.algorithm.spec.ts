import { PlanetType } from '@exodex/shared-types';
import { seededRandom, buildSurfaceDetails } from './surface.algorithm';

const RADIUS = 40;
const CENTER = 60;

/** Renders a surface with fixed geometry so only the tested variable changes. */
function surface(
  type: PlanetType,
  temperatureK: number | null,
  planetName: string,
  options: { animate?: boolean; orbitalPeriodDays?: number | null } = {}
): string {
  return buildSurfaceDetails(
    type,
    RADIUS,
    CENTER,
    '#c4956a',
    '#a07848',
    temperatureK,
    planetName,
    '#dec8a0',
    '#8b6540',
    options.animate ?? false,
    options.orbitalPeriodDays ?? null
  );
}

const durations = (svg: string) =>
  [...svg.matchAll(/dur="([\d.]+)s"/g)].map((m) => Number(m[1]));

describe('seededRandom', () => {
  it('is deterministic for the same seed', () => {
    const a = seededRandom('Kepler-186 f');
    const b = seededRandom('Kepler-186 f');
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = seededRandom('Kepler-186 f');
    const b = seededRandom('TRAPPIST-1 e');
    expect(a()).not.toBe(b());
  });

  it('always returns values inside [0, 1)', () => {
    const rand = seededRandom('proxima-centauri-b');
    for (let i = 0; i < 500; i++) {
      const value = rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('buildSurfaceDetails', () => {
  it('is a pure function of its inputs, element ids included', () => {
    // Ids are seeded from the planet name rather than a random value, so the
    // same planet always renders byte-identical markup.
    expect(surface('jovian', 255, 'Kepler-186 f')).toBe(
      surface('jovian', 255, 'Kepler-186 f')
    );
  });

  it('produces a different surface for a different planet', () => {
    expect(surface('jovian', 255, 'Kepler-186 f')).not.toBe(
      surface('jovian', 255, 'GJ 1214 b')
    );
  });

  it('keeps element ids unique within a render and unique across planets', () => {
    const idsOf = (svg: string) => [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    const first = idsOf(surface('jovian', 255, 'Kepler-186 f'));
    const second = idsOf(surface('jovian', 255, 'GJ 1214 b'));

    expect(new Set(first).size).toBe(first.length);
    // Two planets on the same page must not share a single gradient id.
    expect(first.filter((id) => second.includes(id))).toEqual([]);
  });

  it('always clips the surface to the planet disk', () => {
    for (const type of [
      'rocky-terrestrial',
      'super-earth',
      'mini-neptune',
      'neptunian',
      'jovian',
      'hot-jupiter',
      'cold-giant',
    ] as PlanetType[]) {
      const svg = surface(type, 255, 'Test world');
      expect(svg).toContain('<clipPath');
      expect(svg).toContain(`<circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}"/>`);
    }
  });

  it('uses fractal terrain for rocky bodies and band displacement for giants', () => {
    const rocky = surface('rocky-terrestrial', 250, 'Mars b');
    const giant = surface('jovian', 255, 'Jupiter analog');

    expect(rocky).toContain('fractalNoise');
    expect(rocky).not.toContain('feDisplacementMap');
    expect(giant).toContain('feDisplacementMap');
  });

  it('adds polar caps only for cold rocky worlds', () => {
    expect(surface('rocky-terrestrial', 120, 'Europa b')).toContain('polarcap');
    expect(surface('rocky-terrestrial', 300, 'Mars b')).not.toContain('polarcap');
  });

  it('adds a cloud layer only for temperate super-Earths', () => {
    expect(surface('super-earth', 280, 'Kepler-186 f')).toContain('clouds');
    expect(surface('super-earth', 100, 'Frozen world')).not.toContain('clouds');
    expect(surface('rocky-terrestrial', 280, 'Dry world')).not.toContain('clouds');
  });

  it('emits animation nodes only when animation is enabled', () => {
    expect(surface('jovian', 255, 'Jupiter analog')).not.toContain('<animateTransform');
    expect(surface('jovian', 255, 'Jupiter analog', { animate: true })).toContain(
      '<animateTransform'
    );
  });

  it('spins faster for a short orbital period than for a long one', () => {
    const fast = durations(surface('jovian', 255, 'Jupiter analog', { animate: true, orbitalPeriodDays: 2 }));
    const slow = durations(surface('jovian', 255, 'Jupiter analog', { animate: true, orbitalPeriodDays: 5000 }));

    expect(fast.length).toBeGreaterThan(0);
    expect(Math.max(...fast)).toBeLessThan(Math.min(...slow));
  });

  it('renders an empty clipped group for an unclassified planet type', () => {
    const svg = surface('unknown', 255, 'Mystery world');
    expect(svg).toContain('<clipPath');
    expect(svg).not.toContain('feTurbulence');
  });

  it('tolerates a missing planet name', () => {
    expect(() => surface('neptunian', 200, '')).not.toThrow();
  });
});

import { Color } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { palette } from './palette';
import { createMirrorTiles, DESKTOP_TILE_ROWS, MOBILE_TILE_ROWS } from './mirrorTiles';
import { createTileColors, lightPositions, RaveAnimation, tintTokens } from './raveEffects';

function seeded(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
const silver = new Color(palette.silver);
const accents = tintTokens.map(token => new Color(palette[token]));

describe('rave mirror tiles', () => {
  it.each([MOBILE_TILE_ROWS, DESKTOP_TILE_ROWS])('tints one quarter of %i-row facets with all three pastel accents', rows => {
    const count = createMirrorTiles(rows).length;
    const colors = createTileColors(count, silver, accents, seeded(42));
    const tinted = colors.filter(color => !color.equals(silver));
    expect(tinted).toHaveLength(Math.floor(count / 4));
    for (const color of accents) expect(tinted.some(tile => tile.equals(color))).toBe(true);
    expect(colors.every(color => color.equals(silver) || accents.some(accent => accent.equals(color)))).toBe(true);
    // Every facet owns its color; a flash cannot mutate another tile's base.
    expect(new Set(colors).size).toBe(count);
  });

  it('scatters tinted facets instead of using contiguous or repeating stripes', () => {
    const first = createTileColors(400, silver, accents, seeded(3));
    const second = createTileColors(400, silver, accents, seeded(7));
    const tintIndexes = (colors: Color[]) => colors.flatMap((color, index) => color.equals(silver) ? [] : [index]);
    expect(tintIndexes(first)).not.toEqual(tintIndexes(second));
    for (let quarter = 0; quarter < 4; quarter++) {
      const group = first.slice(quarter * 100, quarter * 100 + 100);
      expect(group.some(color => color.equals(silver))).toBe(true);
      expect(group.some(color => !color.equals(silver))).toBe(true);
    }
  });
});

describe('rave animation', () => {
  it('spins once per 30 seconds while the lights orbit more slowly', () => {
    const animation = new RaveAnimation([silver], () => 0);
    const paint = vi.fn();
    for (let frame = 0; frame < 900; frame++) animation.update(1 / 60, true, paint);
    expect(animation.rotation).toBeCloseTo(Math.PI, 8);
    expect(animation.lightRotation).toBeCloseTo(5 * Math.PI / 8, 8);
    for (let frame = 0; frame < 900; frame++) animation.update(1 / 60, true, paint);
    expect(Math.min(animation.rotation, 2 * Math.PI - animation.rotation)).toBeLessThan(1e-8);
  });

  it('flashes a tile in HDR white for approximately 150ms then restores its exact tint', () => {
    const tint = accents[1];
    const animation = new RaveAnimation([tint], () => 0);
    const paint = vi.fn();
    animation.update(0.9, true, paint);
    const flash = paint.mock.calls[0][1] as Color;
    expect(flash.r).toBeGreaterThan(1);
    expect(flash.r).toBe(flash.g);
    expect(flash.g).toBe(flash.b);
    animation.update(0.149, true, paint);
    expect(paint).toHaveBeenCalledTimes(1);
    animation.update(0.002, true, paint);
    expect(paint).toHaveBeenLastCalledWith(0, tint);
  });

  it('clears glints and freezes both rotations when motion or rendering is disabled', () => {
    const animation = new RaveAnimation([silver], () => 0);
    const paint = vi.fn();
    animation.update(0.9, true, paint);
    const rotation = animation.rotation, lightRotation = animation.lightRotation;
    animation.update(0, false, paint);
    expect(paint).toHaveBeenLastCalledWith(0, silver);
    paint.mockClear();
    animation.update(10, false, paint);
    expect(paint).not.toHaveBeenCalled();
    expect(animation.rotation).toBe(rotation);
    expect(animation.lightRotation).toBe(lightRotation);
  });

  it('emits about one glint per second and never catches up with a flash burst after a stall', () => {
    const animation = new RaveAnimation([silver], seeded(8));
    const paint = vi.fn();
    for (let frame = 0; frame < 600; frame++) animation.update(1 / 60, true, paint);
    const glints = paint.mock.calls.filter(([, color]) => color.r > 1).length;
    expect(glints).toBeGreaterThanOrEqual(8);
    expect(glints).toBeLessThanOrEqual(11);
    paint.mockClear();
    animation.update(30, true, paint);
    expect(paint.mock.calls.filter(([, color]) => color.r > 1)).toHaveLength(1);
  });

  it('does not waste glints on facets hidden behind the ball', () => {
    const animation = new RaveAnimation([silver], () => 0);
    const paint = vi.fn();
    animation.update(0.9, true, paint, () => false);
    expect(paint).not.toHaveBeenCalled();
    animation.update(0.9, true, paint, () => true);
    expect(paint).toHaveBeenCalledTimes(1);
  });

  it('reduces four orbiting desktop lights to two on mobile', () => {
    expect(lightPositions(false)).toHaveLength(4);
    expect(lightPositions(true)).toHaveLength(2);
    for (const [x, y, z] of [...lightPositions(false), ...lightPositions(true)]) {
      expect(Math.hypot(x, z)).toBeCloseTo(2.7);
      expect(Number.isFinite(y)).toBe(true);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { createMirrorTiles, DESKTOP_TILE_ROWS, MOBILE_TILE_ROWS } from './mirrorTiles';

describe('mirror ball facets', () => {
  it.each([MOBILE_TILE_ROWS, DESKTOP_TILE_ROWS])('builds actual outward-facing square facets with %i latitude rows', rows => {
    const tiles = createMirrorTiles(rows);
    expect(tiles.length).toBeGreaterThan(300);
    for (const { matrix } of tiles) {
      const position = new Vector3(), orientation = new Quaternion(), scale = new Vector3();
      matrix.decompose(position, orientation, scale);
      expect(position.length()).toBeCloseTo(1, 10);
      expect(scale.x).toBeCloseTo(scale.y, 10);
      expect(scale.z).toBeLessThan(scale.x / 5);
      const faceNormal = new Vector3(0, 0, 1).applyQuaternion(orientation);
      expect(faceNormal.dot(position)).toBeCloseTo(1, 10);
      expect(matrix.determinant()).toBeGreaterThan(0);
    }
    // Tiles cover both poles and all sides rather than a flat front hemisphere.
    for (const axis of ['x', 'y', 'z'] as const) {
      const values = tiles.map(tile => new Vector3().setFromMatrixPosition(tile.matrix)[axis]);
      expect(Math.min(...values)).toBeLessThan(-.98);
      expect(Math.max(...values)).toBeGreaterThan(.98);
    }
  });
  it('reduces mobile geometry substantially while keeping dense coverage', () => {
    const desktop = createMirrorTiles(DESKTOP_TILE_ROWS);
    const mobile = createMirrorTiles(MOBILE_TILE_ROWS);
    expect(mobile.length).toBeLessThan(desktop.length / 2);
    expect(mobile.length).toBeGreaterThan(300);
  });
});

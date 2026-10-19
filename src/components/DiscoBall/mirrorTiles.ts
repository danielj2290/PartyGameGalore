import { Matrix4, Quaternion, Vector3 } from 'three';

export const MOBILE_TILE_ROWS = 18;
export const DESKTOP_TILE_ROWS = 30;
export const ROTATION_SECONDS = 30;

// Equal-size square boxes, tangent to a sphere. Their individual planar normals
// reflect the environment independently; the mirrors are real geometry.
export function createMirrorTiles(rows: number) {
  const tiles: { matrix: Matrix4 }[] = [];
  const step = Math.PI / rows;
  const edge = step * .93;
  const forward = new Vector3(0, 0, 1);
  const scale = new Vector3(edge, edge, .012);
  for (let row = 0; row < rows; row++) {
    const latitude = (row + .5) * step;
    const ringRadius = Math.sin(latitude);
    const count = Math.max(3, Math.floor(2 * Math.PI * ringRadius / step));
    for (let column = 0; column < count; column++) {
      const longitude = (column + (row % 2 ? .5 : 0)) / count * 2 * Math.PI;
      const normal = new Vector3(ringRadius * Math.cos(longitude), Math.cos(latitude), ringRadius * Math.sin(longitude));
      const orientation = new Quaternion().setFromUnitVectors(forward, normal);
      tiles.push({ matrix: new Matrix4().compose(normal, orientation, scale) });
    }
  }
  return tiles;
}

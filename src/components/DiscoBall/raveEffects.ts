import { Color } from 'three';
import { ROTATION_SECONDS } from './mirrorTiles';

export const GLINT_SECONDS = 0.15;
export const LIGHT_ORBIT_SECONDS = 48;
export const lightTokens = ['pink', 'periwinkle', 'lavender', 'silver'] as const;
export const tintTokens = ['pink', 'periwinkle', 'lavender'] as const;
const brightWhite = new Color(5, 5, 5);

/** Scatter an exact quarter of tinted tiles among neutral mirror facets. */
export function createTileColors(count: number, silver: Color, accents: readonly Color[], random = Math.random) {
  const colors = Array.from({ length: count }, () => silver.clone());
  const available = Array.from({ length: count }, (_, index) => index);
  for (let index = 0; index < Math.floor(count / 4); index++) {
    const swap = index + Math.floor(random() * (count - index));
    [available[index], available[swap]] = [available[swap], available[index]];
    colors[available[index]] = accents[Math.floor(random() * accents.length)].clone();
  }
  return colors;
}

export function lightPositions(mobile: boolean): [number, number, number][] {
  const count = mobile ? 2 : 4;
  return Array.from({ length: count }, (_, index) => {
    const angle = 0.4 + index * Math.PI * 2 / count;
    return [Math.cos(angle) * 2.7, 0.5 + Math.sin(angle * 1.5) * 1.1, Math.sin(angle) * 2.7];
  });
}

type Paint = (index: number, color: Color) => void;

/** Animation state lives outside React: no render/state updates per frame. */
export class RaveAnimation {
  rotation = 0;
  lightRotation = 0;
  private time = 0;
  private nextGlint: number;
  private flashes = new Map<number, number>();

  constructor(private colors: readonly Color[], private random = Math.random) {
    this.nextGlint = this.interval();
  }

  private interval() { return 0.9 + this.random() * 0.2; }

  update(delta: number, enabled: boolean, paint: Paint, visible: (index: number) => boolean = () => true) {
    let changed = false;
    if (!enabled) {
      this.flashes.forEach((_, index) => { paint(index, this.colors[index]); changed = true; });
      this.flashes.clear();
      this.time = 0;
      this.nextGlint = this.interval();
      return changed;
    }

    const step = Math.max(0, delta);
    // Avoid a spin jump when a hidden tab or off-screen canvas resumes.
    const motionStep = Math.min(step, 0.1);
    this.rotation = (this.rotation + motionStep * Math.PI * 2 / ROTATION_SECONDS) % (Math.PI * 2);
    this.lightRotation = (this.lightRotation + motionStep * Math.PI * 2 / LIGHT_ORBIT_SECONDS) % (Math.PI * 2);
    this.time += step;
    this.flashes.forEach((until, index) => {
      if (until <= this.time) {
        paint(index, this.colors[index]);
        this.flashes.delete(index);
        changed = true;
      }
    });

    if (this.time >= this.nextGlint && this.colors.length) {
      // Pick a visible facet so glints don't disappear on the back of the ball.
      for (let attempt = 0; attempt < 16; attempt++) {
        const index = Math.floor(this.random() * this.colors.length);
        if (!visible(index)) continue;
        // HDR instance color makes a white glint without bloom or extra passes.
        paint(index, brightWhite);
        this.flashes.set(index, this.time + GLINT_SECONDS);
        changed = true;
        break;
      }
      // Never catch up with a burst of flashes after a stalled frame.
      this.nextGlint = this.time + this.interval();
    }
    return changed;
  }
}

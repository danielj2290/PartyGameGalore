import { useEffect, useRef } from 'react';
import { createFramePacer } from '../framePacer';
import styles from './DanceFloor.module.css';

const columns = 32;
const rows = 8;
const cellWidth = 40;
const cellHeight = 20;
const pulseSeconds = 2 * Math.PI / 3;
const colorSeconds = 12;
const framesPerSecond = 20;
const pink = [0xff, 0x69, 0xdf];
const periwinkle = [0x8f, 0xa6, 0xff];
const blue = [0x4c, 0x8d, 0xff];
const cycle = [pink, periwinkle, blue];

// Stable, dispersed phases keep neighboring tiles from pulsing in unison.
const tiles = Array.from({ length: columns * rows }, (_, index) => {
  const row = Math.floor(index / columns);
  const column = index % columns;
  return {
    x: column * cellWidth, y: row * cellHeight,
    base: (row + column) % 2 === 0 ? pink : blue,
    pulsePhase: ((index * 73 + row * 29) % 257) / 257,
    colorPhase: ((index * 47) % 251) / 251,
  };
});

function cycleColor(progress: number) {
  const scaled = progress * cycle.length;
  const from = cycle[Math.floor(scaled) % cycle.length];
  const to = cycle[(Math.floor(scaled) + 1) % cycle.length];
  const mix = scaled % 1;
  return from.map((value, channel) => value + (to[channel] - value) * mix);
}

/** One canvas replaces 256 animated elements, so the floor never triggers style recalculation. */
function paint(context: CanvasRenderingContext2D, seconds: number, still: boolean) {
  for (const tile of tiles) {
    // Matches the former ease-in-out keyframes: dim at 0%/100%, brightest at 50%.
    const wave = still ? 0 : (1 - Math.cos(2 * Math.PI * ((seconds / pulseSeconds + tile.pulsePhase) % 1))) / 2;
    const alpha = still ? .25 : .18 + .77 * wave;
    const brightness = still ? 1 : .55 + 1.1 * wave;
    const glow = still ? tile.base : cycleColor((seconds / colorSeconds + tile.colorPhase) % 1);
    const [r, g, b] = tile.base.map((value, channel) => Math.round(value * (1 - alpha) + Math.min(255, glow[channel] * brightness) * alpha));
    context.fillStyle = `rgb(${tile.base.join(',')})`;
    context.fillRect(tile.x, tile.y, cellWidth, cellHeight);
    context.fillStyle = `rgb(${r},${g},${b})`;
    context.fillRect(tile.x + 1, tile.y + 1, cellWidth - 2, cellHeight - 2);
  }
}

export function DanceFloor() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    // Skip drawing in environments without 2D canvas support (including jsdom).
    if (typeof window.CanvasRenderingContext2D === 'undefined') return;
    const context = canvas.current?.getContext('2d');
    if (!context) return;
    // Phones get a still floor: repainting it is too heavy there.
    const stillFloor = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 700px), (pointer: coarse)') : null;
    let frame = 0;
    const due = createFramePacer(framesPerSecond);
    const draw = (time: number) => {
      if (stillFloor?.matches) { paint(context, 0, true); return; }
      frame = requestAnimationFrame(draw);
      if (due(time)) paint(context, time / 1000, false);
    };
    const restart = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    restart();
    stillFloor?.addEventListener('change', restart);
    return () => { cancelAnimationFrame(frame); stillFloor?.removeEventListener('change', restart); };
  }, []);
  return <div className={styles.stage} aria-hidden="true">
    <canvas ref={canvas} className={styles.floor} width={columns * cellWidth} height={rows * cellHeight} />
  </div>;
}

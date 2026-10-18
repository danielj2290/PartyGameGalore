import { useId, useRef } from 'react';
import type { PointerEvent } from 'react';
import type { Spectrum } from './spectra';
import styles from './Wavelength.module.css';

const point = (position: number, radius = 267) => ({
  x: 320 - radius * Math.cos(position / 100 * Math.PI),
  y: 300 - radius * Math.sin(position / 100 * Math.PI),
});
function wedge(start: number, end: number) {
  const a = point(Math.max(0, start)), b = point(Math.min(100, end));
  return `M320 300 L${a.x} ${a.y} A267 267 0 0 1 ${b.x} ${b.y} Z`;
}
export function Dial({ spectrum, guess, target, onChange }: {
  spectrum: Spectrum; guess?: number; target?: number; onChange?: (value: number) => void;
}) {
  const id = useId();
  const dragging = useRef(false);
  const needle = point(guess ?? 50, 250);
  const positionText = (value: number) => value < 15 ? `Near ${spectrum.left}` : value < 40 ? `Toward ${spectrum.left}` :
    value <= 60 ? 'Around the middle' : value <= 85 ? `Toward ${spectrum.right}` : `Near ${spectrum.right}`;
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!onChange) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) / rect.width * 640;
    const y = (event.clientY - rect.top) / rect.height * 340;
    onChange(Math.round(Math.atan2(Math.max(0, 300 - y), 320 - x) / Math.PI * 100));
  };
  return <div className={styles.dial}>
    <svg viewBox="0 0 640 340" role="img" aria-labelledby={`${id}-title ${id}-description`}
      className={onChange ? styles.interactiveDial : undefined}
      onPointerDown={event => { if (!onChange) return; dragging.current = true; event.currentTarget.setPointerCapture?.(event.pointerId); move(event); }}
      onPointerMove={event => { if (dragging.current) move(event); }}
      onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
      <title id={`${id}-title`}>{target === undefined ? 'Hidden-target dial' : 'Target revealed'}</title>
      <desc id={`${id}-description`}>{`${spectrum.left} on the left; ${spectrum.right} on the right. `}{target === undefined ? 'The target is hidden.' : 'The center is worth 4 points, the adjacent bands 3, and the outer bands 2.'}{guess !== undefined ? ` Needle: ${positionText(guess)}.` : ''}</desc>
      <path d="M40 300 A280 280 0 0 1 600 300 L320 300 Z" fill="#24242b" stroke="#ffffff25" strokeWidth="2" />
      {target !== undefined && <g data-testid="wavelength-target">
        <path d={wedge(target - 11, target + 11)} fill="#6089d8" />
        <path d={wedge(target - 7, target + 7)} fill="#d986c9" />
        <path d={wedge(target - 3, target + 3)} fill="#fff1b3" />
        {([-9, -5, 0, 5, 9] as const).map(offset => {
          if (target + offset < 0 || target + offset > 100) return null;
          const p = point(target + offset, 208);
          return <text key={offset} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="#241c29" fontSize="19" fontWeight="800">{offset === 0 ? 4 : Math.abs(offset) === 5 ? 3 : 2}</text>;
        })}
      </g>}
      <g stroke="#ffffff25" strokeWidth="2">{Array.from({ length: 11 }, (_, i) => {
        const a = point(i * 10, 269), b = point(i * 10, 279);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })}</g>
      {guess !== undefined && <g aria-hidden="true"><line x1="320" y1="300" x2={needle.x} y2={needle.y} stroke="var(--team)" strokeWidth="7" strokeLinecap="round" /><circle cx="320" cy="300" r="19" fill="var(--team)" /><circle cx="320" cy="300" r="8" fill="#28232f" /></g>}
      {target === undefined && <text x="320" y="170" textAnchor="middle" fill="#c2bdc7" fontSize="13" letterSpacing="2">TRUST YOUR PEOPLE</text>}
    </svg>
    <div className={styles.endpoints}><strong>{spectrum.left}</strong><span aria-hidden="true">TO</span><strong>{spectrum.right}</strong></div>
    {onChange && <label className={styles.sliderLabel}>Move the dial<input type="range" min="0" max="100" step="1" value={guess ?? 50} aria-valuetext={positionText(guess ?? 50)} onChange={event => onChange(Number(event.target.value))} /><span>Drag the needle, tap the arc, or use the slider and arrow keys.</span></label>}
  </div>;
}

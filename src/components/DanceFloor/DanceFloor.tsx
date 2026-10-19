import { type CSSProperties } from 'react';
import styles from './DanceFloor.module.css';

const columns = 32;
const tiles = Array.from({ length: columns * 8 }, (_, index) => {
  const row = Math.floor(index / columns);
  const column = index % columns;
  // Stable, dispersed phases keep neighboring tiles from pulsing in unison.
  const phase = ((index * 73 + row * 29) % 257) / 257;
  return {
    '--tile-base': (row + column) % 2 === 0 ? 'var(--pink)' : 'var(--blue)',
    '--pulse-delay': `${-phase * (2 * Math.PI / 3)}s`,
    '--color-delay': `${-((index * 47) % 251) / 251 * 12}s`,
  } as CSSProperties;
});

export function DanceFloor() {
  return <div className={styles.stage} aria-hidden="true"><div className={styles.floor}>
    {tiles.map((style, index) => <span key={index} className={styles.tile} style={style} />)}
  </div></div>;
}

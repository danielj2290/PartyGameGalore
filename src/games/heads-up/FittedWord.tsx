import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import styles from './HeadsUp.module.css';

export function FittedWord({ text, fit }: { text: string; fit: boolean }) {
  const space = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (!fit) return;
    let mounted = true;
    const resize = () => {
      const container = space.current;
      const element = word.current;
      if (!mounted || !container || !element) return;
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      // Measure wrapped text, including long titles, against the actual card space.
      let low = 1;
      let high = 140;
      while (low < high) {
        const size = Math.ceil((low + high) / 2);
        element.style.fontSize = `${size}px`;
        // Browser scroll metrics round to whole pixels; card bounds can be fractional.
        if (element.scrollWidth <= Math.ceil(width) && element.scrollHeight <= Math.floor(height)) low = size;
        else high = size - 1;
      }
      element.style.fontSize = `${low}px`;
    };
    resize();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    if (space.current) observer?.observe(space.current);
    window.addEventListener('resize', resize);
    void document.fonts?.ready.then(resize);
    return () => { mounted = false; observer?.disconnect(); window.removeEventListener('resize', resize); };
  }, [text, fit]);
  return <div ref={space} className={styles.wordSpace}>
    <h2 ref={word} className={styles.word} style={{ '--word-scale': Math.min(1, Math.sqrt(18 / (text.length || 1))) } as CSSProperties} data-testid="heads-up-word" aria-live="polite" aria-atomic="true">{text}</h2>
  </div>;
}

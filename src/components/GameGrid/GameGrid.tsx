import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { games } from '../../games/registry';
import { GameCard } from '../GameCard/GameCard';
import { Icon } from '../Icon/Icon';
import styles from './GameGrid.module.css';

// Matches the breakpoints in GameGrid.module.css.
const layouts = [{ query: '(min-width: 900px)', perView: 3 }, { query: '(min-width: 651px)', perView: 2 }];
const swipeDistance = 40;
// Remember the position while the app is open, so returning from a rules page keeps your place.
let rememberedStart = 0;

function usePerView() {
  const read = () => typeof window.matchMedia === 'function' ? layouts.find(layout => window.matchMedia(layout.query).matches)?.perView ?? 1 : 3;
  const [perView, setPerView] = useState(read);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const lists = layouts.map(layout => window.matchMedia(layout.query));
    const update = () => setPerView(read());
    lists.forEach(list => list.addEventListener('change', update));
    return () => lists.forEach(list => list.removeEventListener('change', update));
  }, []);
  return perView;
}

export function GameGrid() {
  const perView = usePerView();
  const last = Math.max(0, games.length - perView);
  const [start, setStart] = useState(() => Math.min(rememberedStart, last));
  const touchX = useRef<number | null>(null);
  const shown = Math.min(start, last);
  useEffect(() => { rememberedStart = shown; }, [shown]);
  const go = (next: number) => setStart(Math.max(0, Math.min(last, next)));
  const end = Math.min(games.length, shown + perView);
  return <section id="games" className={styles.section} aria-roledescription="carousel" aria-label="Games"
    onKeyDown={event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(shown - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(shown + 1); }
    }}>
    <div className={styles.carousel}>
      <button className={`${styles.arrow} ${styles.previous}`} aria-label="Previous games" disabled={shown === 0} onClick={() => go(shown - 1)}><span className={styles.flip}><Icon name="arrowRight" /></span></button>
      <div className={styles.viewport}
        onTouchStart={event => { touchX.current = event.touches[0].clientX; }}
        onTouchEnd={event => {
          if (touchX.current === null) return;
          const distance = event.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(distance) > swipeDistance) go(shown + (distance < 0 ? 1 : -1));
        }}>
        <div className={styles.track} style={{ '--per-view': perView, '--start': shown } as CSSProperties}>
          {games.map((game, index) => {
            const visible = index >= shown && index < end;
            return <div key={game.id} className={styles.slide} inert={!visible} aria-hidden={!visible} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${games.length}`}>
              <GameCard game={game} index={index} />
            </div>;
          })}
        </div>
      </div>
      <button className={`${styles.arrow} ${styles.next}`} aria-label="Next games" disabled={shown === last} onClick={() => go(shown + 1)}><Icon name="arrowRight" /></button>
      <div className={styles.dots}>
        {Array.from({ length: last + 1 }, (_, index) => <button key={index} className={styles.dot} aria-label={`Show games ${index + 1}–${index + perView}`} aria-current={index === shown} onClick={() => go(index)} />)}
      </div>
    </div>
    <p className={styles.srOnly} aria-live="polite">Showing games {shown + 1}–{end} of {games.length}</p>
  </section>;
}

import { Icon } from '../../components/Icon/Icon';
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LightReflections } from '../../components/LightReflections/LightReflections';
import { GameDialog } from '../shared/GameDialog';
import { useHeadsUp } from './HeadsUpContext';
import styles from './HeadsUp.module.css';

export function HeadsUpLayout() {
  const { match, dispatch, device, landscape } = useHeadsUp();
  const [exit, setExit] = useState(false);
  const content = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const inPlay = location.pathname === '/heads-up/play';
  const live = inPlay && match && match.phase !== 'finished';
  const phoneViewport = inPlay && device === 'phone' && landscape;
  useEffect(() => {
    document.title = 'Heads Up — Party Games Galore'; window.scrollTo(0, 0);
    content.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [location.pathname]);
  return <div className={`${styles.page} ${inPlay ? styles.gamePage : ''} ${phoneViewport ? styles.phoneViewport : ''}`}>
    <LightReflections />
    <header className={styles.header}>
      <Link className={styles.brand} to="/" aria-label="Party Games Galore home" onClick={event => { if (live) { event.preventDefault(); dispatch({ type: 'PAUSE', now: performance.now() }); setExit(true); } }}><span aria-hidden="true"><Icon name="burst" /></span> PGG.</Link>
      <span className={styles.headerLabel}>HEADS UP <span>· GET YOUR PEOPLE GUESSING</span></span>
      {live ? <button className={styles.textButton} onClick={() => { dispatch({ type: 'PAUSE', now: performance.now() }); setExit(true); }}>Exit game</button> : <Link className={styles.textLink} to="/">Back to home <Icon name="arrowUpRight" /></Link>}
    </header>
    <main ref={content} className={styles.main}><Outlet /></main>
    <footer className={styles.footer}>GOOD CLUES. GREAT COMPANY. <span aria-hidden="true"><Icon name="sparkle" /></span></footer>
    {exit && <GameDialog title="Leave this game?" onCancel={() => setExit(false)}><p>Your current match will be cleared. Your settings stay ready for next time.</p><div className={styles.actions}><button className={styles.secondary} onClick={() => setExit(false)}>Stay here</button><button className={styles.primary} onClick={() => { setExit(false); navigate('/'); }}>Exit home</button></div></GameDialog>}
  </div>;
}

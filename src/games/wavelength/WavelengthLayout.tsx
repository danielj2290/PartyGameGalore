import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon/Icon';
import { LightReflections } from '../../components/LightReflections/LightReflections';
import { GameDialog } from '../shared/GameDialog';
import { useWavelength } from './WavelengthContext';
import styles from './Wavelength.module.css';

export function WavelengthLayout() {
  const { match, dispatch } = useWavelength();
  const [exit, setExit] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const content = useRef<HTMLElement>(null);
  const live = location.pathname === '/wavelength/play' && match && match.phase !== 'finished';
  useEffect(() => {
    document.title = 'Wavelength — Party Games Galore'; window.scrollTo(0, 0);
    content.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [location.pathname]);
  function requestExit() { dispatch({ type: 'PAUSE', now: performance.now() }); setExit(true); }
  return <div className={styles.page}>
    <LightReflections />
    <header className={styles.header}>
      <Link className={styles.brand} to="/" aria-label="Party Games Galore home" onClick={event => { if (live) { event.preventDefault(); requestExit(); } }}><span><Icon name="burst" /></span> PGG.</Link>
      <span className={styles.headerLabel}>WAVELENGTH <span>· GET ON THE SAME FREQUENCY</span></span>
      {live ? <button className={styles.textButton} onClick={requestExit}>Exit game</button> : <Link className={styles.textLink} to="/">Back to home <Icon name="arrowUpRight" /></Link>}
    </header>
    <main ref={content} className={styles.main}><Outlet /></main>
    <footer className={styles.footer}>GOOD CLUES. SHARED INSTINCTS. <Icon name="sparkle" /></footer>
    {exit && <GameDialog title="Leave this game?" onCancel={() => setExit(false)}><p>Your match will be cleared. Your settings stay ready for next time.</p><div className={styles.actions}><button className={styles.secondary} onClick={() => setExit(false)}>Stay here</button><button className={styles.primary} onClick={() => { setExit(false); navigate('/'); }}>Exit home</button></div></GameDialog>}
  </div>;
}

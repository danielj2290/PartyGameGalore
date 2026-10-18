import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCharades } from './CharadesContext';
import { Dialog } from './Dialog';
import { LightReflections } from '../../components/LightReflections/LightReflections';
import styles from './Charades.module.css';

export function CharadesLayout() {
  const { match, dispatch } = useCharades();
  const [exit, setExit] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const content = useRef<HTMLElement>(null);
  const inGame = location.pathname.endsWith('/play') || location.pathname.endsWith('/results');
  useEffect(() => {
    window.scrollTo(0, 0);
    content.current?.querySelector<HTMLElement>('h1')?.focus();
    document.title = `Charades — Party Games Galore`;
  }, [location.pathname]);
  function leave() { setExit(false); navigate('/'); }
  return <div className={styles.page}>
    <LightReflections />
    <header className={styles.header}>
      <Link className={styles.brand} to="/" onClick={event => {
        if (inGame && match && match.phase !== 'finished') { event.preventDefault(); dispatch({ type: 'PAUSE', now: performance.now() }); setExit(true); }
      }}><span aria-hidden="true">✳</span> PGG.</Link>
      <span className={styles.headerGame}>CHARADES <span>· LOCAL PARTY GAME</span></span>
      {inGame && match?.phase !== 'finished' ? <button className={styles.textButton} onClick={() => { dispatch({ type: 'PAUSE', now: performance.now() }); setExit(true); }}>Exit game</button> : <Link className={styles.textLink} to="/">Back to home ↗</Link>}
    </header>
    <main ref={content} className={styles.main}><Outlet /></main>
    <footer className={styles.footer}>GOOD COMPANY. GREAT GUESSES. <span aria-hidden="true">✦</span></footer>
    {exit && <Dialog title="Leave this game?" onCancel={() => setExit(false)}><p>Your current match will be cleared. Your settings will stay for the next game.</p><div className={styles.actions}><button className={styles.secondary} onClick={() => setExit(false)}>Stay here</button><button className={styles.primary} onClick={leave}>Exit home</button></div></Dialog>}
  </div>;
}

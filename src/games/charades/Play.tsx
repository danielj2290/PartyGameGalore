import { Icon } from '../../components/Icon/Icon';
import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useCharades } from './CharadesContext';
import { activeTeam, roundNumber, score, skipsUsed } from './engine';
import { Scoreboard } from './Scoreboard';
import { Review } from './Review';
import { Dialog } from './Dialog';
import styles from './Charades.module.css';

export function Play() {
  const { match, dispatch, muted, toggleSound, unlockAudio } = useCharades();
  const [reset, setReset] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [match?.phase]);
  useEffect(() => {
    if (match?.phase === 'ready' || match?.phase === 'reviewing') setReset(false);
  }, [match?.phase]);
  if (!match) return <Navigate to="/charades/settings" replace />;
  if (match.phase === 'finished') return <Navigate to="/charades/results" replace />;
  const team = activeTeam(match);
  const ready = match.phase === 'ready';
  const playing = match.phase === 'playing';
  const seconds = Math.ceil(match.remainingMs / 1000);
  const used = skipsUsed(match);
  const noSkips = match.settings.skips !== null && used >= match.settings.skips;
  const word = match.entries.at(-1)?.word;
  return <section className={`${styles.playScreen} ${team === 1 ? styles.teamPink : styles.teamBlue}`}>
    <div className={styles.playHeading}>
      <div><p className={styles.eyebrow}>TEAM {team} · ROUND {roundNumber(match)} OF {match.settings.rounds}</p><h1 tabIndex={-1} ref={heading}>{ready ? 'Your team. Your moment.' : match.phase === 'paused' ? 'Take a breather.' : match.phase === 'reviewing' ? 'What a performance.' : 'Act it out!'}</h1></div>
      <div className={styles.timerPanel}>
        <div role="timer" aria-label={`${seconds} seconds remaining`} className={`${styles.timer} ${seconds <= 10 ? styles.urgent : ''}`}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</div>
        <div className={styles.timerControls}>
          {!ready && <button className={styles.smallButton} disabled={match.phase === 'reviewing'} onClick={() => { unlockAudio(); dispatch({ type: playing ? 'PAUSE' : 'RESUME', now: performance.now() }); }}>{playing ? "Pause" : "Resume"}</button>}
          <button className={styles.smallButton} aria-pressed={muted} aria-label={muted ? 'Unmute timer sounds' : 'Mute timer sounds'} onClick={toggleSound}>{muted ? 'Sound off' : 'Sound on'}</button>
        </div>
      </div>
    </div>
    <div className={styles.wordCard}>
      <span className={styles.cardKicker}>TEAM {team} <span aria-hidden="true"><Icon name="sparkle" /></span> {match.settings.difficulty.toUpperCase()}</span>
      {ready ? <div className={styles.readyContent}><span className={styles.readyStar} aria-hidden="true"><Icon name="burst" /></span><h2>Actors, take the screen.</h2><p>Pass the device to your actor.<br />Keep the word hidden from your team.</p><button className={styles.primary} onClick={() => { unlockAudio(); dispatch({ type: 'START', now: performance.now() }); }}>Start turn <span aria-hidden="true"><Icon name="arrowUpRight" /></span></button><span className={styles.hint}>Switch actors each turn. Let everyone have a go.</span></div>
        : playing ? <><h2 className={styles.word} aria-live="polite" aria-atomic="true">{word?.text}</h2><p className={styles.wordHint}>No words. Just your best moves.</p></>
          : <div className={styles.readyContent}><span className={styles.readyStar} aria-hidden="true"><Icon name="pause" /></span><h2>{match.phase === 'paused' ? 'Game paused' : 'Turn complete'}</h2><p>{match.phase === 'paused' ? 'Stop guessing. The word stays hidden until you resume.' : 'Review your words before the next team takes over.'}</p>{match.phase === 'paused' && <button className={styles.primary} onClick={() => { unlockAudio(); dispatch({ type: 'RESUME', now: performance.now() }); }}>Resume turn <Icon name="play" /></button>}</div>}
    </div>
    {!ready && <><div className={styles.wordActions}>
      <button className={styles.skipButton} disabled={!playing || noSkips} aria-describedby="skip-status" onClick={() => dispatch({ type: 'RECORD', outcome: 'skipped', now: performance.now() })}>Skip <span aria-hidden="true"><Icon name="arrowRight" /></span></button>
      <button className={styles.correctButton} disabled={!playing} onClick={() => dispatch({ type: 'RECORD', outcome: 'correct', now: performance.now() })}>Correct <span aria-hidden="true"><Icon name="check" /></span></button>
    </div><div className={styles.turnDetails}><span id="skip-status">{match.settings.skips === null ? 'Unlimited skips' : noSkips ? 'No skips remaining' : `${match.settings.skips - used} skips remaining`}</span><span>{score(match.entries)} points this turn</span><button className={styles.textButton} disabled={match.phase === 'reviewing'} onClick={() => { dispatch({ type: 'PAUSE', now: performance.now() }); setReset(true); }}>Reset turn</button></div></>}
    <p className={styles.timerNotice} role="status" aria-live="polite">{playing && seconds <= 10 ? (seconds <= 5 ? 'Final seconds — last guesses!' : '10 seconds or less — make them count!') : match.phase === 'paused' ? 'Timer paused. Resume when everyone is ready.' : '\u00a0'}</p>
    <Scoreboard match={match} />
    {match.phase === 'reviewing' && <Review match={match} />}
    {reset && match.phase === 'paused' && <Dialog title="Start this turn over?" onCancel={() => setReset(false)}><p>This clears Team {team}’s current words and points and restores its full timer and skip allowance. Earlier turns stay saved.</p><div className={styles.actions}><button className={styles.secondary} onClick={() => setReset(false)}>Keep turn paused</button><button className={styles.primary} onClick={() => { dispatch({ type: 'RESET' }); setReset(false); }}>Reset this turn</button></div></Dialog>}
  </section>;
}

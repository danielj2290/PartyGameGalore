import { Icon } from '../../components/Icon/Icon';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { GameDialog } from '../shared/GameDialog';
import { useHeadsUp } from './HeadsUpContext';
import { activeParticipant, teamRounds } from './engine';
import { categories } from './categories';
import { Review } from './Review';
import { FittedWord } from './FittedWord';
import styles from './HeadsUp.module.css';

export function Play() {
  const { match, dispatch, device, controls, motion, landscape, useButtons, settings, muted, toggleSound, unlockAudio } = useHeadsUp();
  const [reset, setReset] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const phone = device === 'phone';
  const motionMode = phone && controls === 'motion';
  const sensorBlocked = motionMode && motion.status !== 'ready';
  const orientationBlocked = phone && !landscape;
  useEffect(() => { heading.current?.focus(); if (match?.phase === 'ready' || match?.phase === 'reviewing') setReset(false); }, [match?.phase]);
  useEffect(() => {
    if (match?.phase !== 'playing' || sensorBlocked || orientationBlocked) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof HTMLElement && event.target.closest('input,select,textarea,[contenteditable="true"],dialog'))) return;
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      if (event.repeat) return;
      dispatch({ type: 'RECORD', outcome: event.key === 'ArrowUp' ? 'correct' : 'skipped', now: performance.now() });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [match?.phase, dispatch, sensorBlocked, orientationBlocked]);
  if (!match) return <Navigate to="/heads-up/settings" replace />;
  if (match.phase === 'finished') return <Navigate to="/heads-up/results" replace />;
  const person = activeParticipant(match);
  const playing = match.phase === 'playing' && !orientationBlocked && !sensorBlocked;
  const ready = match.phase === 'ready';
  const seconds = Math.ceil(match.remainingMs / 1000);
  const turn = match.completed.length + 1;
  const startBlocked = orientationBlocked || sensorBlocked;
  const currentWord = match.entries.at(-1)?.word.text;
  const lastOutcome = match.entries.at(-2)?.outcome;
  return <section className={`${styles.playScreen} ${phone ? styles.phonePlay : ''}`} style={{ '--participant': person.color } as CSSProperties}>
    <div className={styles.playHeading}><div><p className={styles.eyebrow}>{person.label.toUpperCase()} · TURN {turn} OF {match.schedule.length}{match.settings.mode === 'teams' ? ` · ROUND ${match.schedule[match.completed.length].round}/${teamRounds(match.settings.players)}` : ''}</p><h1 ref={heading} tabIndex={-1}>{playing ? 'Give them a clue!' : ready ? 'Your turn to guess.' : match.phase === 'countdown' ? 'Get in position.' : match.phase === 'paused' ? 'Take a breather.' : 'What a round.'}</h1></div>
      <div className={styles.timerPanel}><div className={`${styles.timer} ${seconds <= 10 ? styles.urgent : ''}`} role="timer" aria-label={`${seconds} seconds remaining`}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</div><div className={styles.timerControls}>{!ready && match.phase !== 'countdown' && <button className={styles.smallButton} disabled={match.phase === 'reviewing' || startBlocked} onClick={() => { unlockAudio(); dispatch({ type: match.phase === 'playing' ? 'PAUSE' : 'RESUME', now: performance.now() }); }}>{match.phase === 'playing' ? "Pause" : "Resume"}</button>}<button className={styles.smallButton} aria-pressed={muted} aria-label={muted ? 'Unmute timer sounds' : 'Mute timer sounds'} onClick={toggleSound}>{muted ? 'Sound off' : 'Sound on'}</button></div></div>
    </div>
    {(orientationBlocked || sensorBlocked) && <div className={styles.inputNotice} role="status">{orientationBlocked ? <p><Icon name="rotate" /> Turn your phone sideways. Play stays paused until you’re ready.</p> : <><p>Motion isn’t ready. Reconnect it or ask a friend to use Assisted play.</p><div className={styles.actions}><button className={styles.secondary} onClick={() => void motion.enable()}>Retry motion</button><button className={styles.secondary} onClick={useButtons}>Use Assisted play</button><Link className={styles.textLink} to="/heads-up/setup">Device setup</Link></div></>}</div>}
    <div className={styles.wordCard}>
      <span className={styles.cardKicker}>{person.label.toUpperCase()} <span aria-hidden="true"><Icon name="sparkle" /></span> {categories.find(category => category.id === match.settings.category)?.label}</span>
      {ready ? <div className={styles.readyContent}><span className={styles.readyStar} aria-hidden="true"><Icon name="burst" /></span><h2>Keep the answer out of sight.</h2><p>{phone ? 'Hold the phone sideways, screen facing your clue-givers.' : 'Face the screen toward your clue-givers. Let a friend handle the keys.'}<br />{match.settings.mode === 'teams' ? 'Choose a new guesser from your team.' : `Pass the device to ${person.label}.`}</p><button className={styles.primary} disabled={startBlocked} onClick={() => { unlockAudio(); dispatch({ type: 'ARM', now: performance.now() }); }}>Start turn <Icon name="arrowUpRight" /></button><span className={styles.hint}>You’ll have 3 seconds to get in position.</span></div>
        : match.phase === 'countdown' ? <div className={styles.countdown} role="status" aria-live="polite"><strong>{Math.ceil(match.countdownMs / 1000)}</strong><p>Screen away. Friends ready.</p></div>
          : playing ? <FittedWord text={currentWord ?? ''} fit={phone && landscape} />
            : <div className={styles.readyContent}><span className={styles.readyStar} aria-hidden="true"><Icon name="pause" /></span><h2>{match.phase === 'reviewing' ? 'Turn complete' : 'Game paused'}</h2><p>{match.phase === 'reviewing' ? 'Review the words before passing the device.' : 'Stop guessing. The answer stays hidden until you resume.'}</p>{match.phase === 'paused' && <button className={styles.primary} disabled={startBlocked} onClick={() => { unlockAudio(); dispatch({ type: 'RESUME', now: performance.now() }); }}>Resume turn <Icon name="play" /></button>}</div>}
    </div>
    {settings.assistedPlay && !ready && match.phase !== 'countdown' && <div className={styles.wordActions}><button className={styles.skipButton} disabled={!playing} onClick={() => dispatch({ type: 'RECORD', outcome: 'skipped', now: performance.now() })}><Icon name="arrowDown" /> Skip</button><button className={styles.correctButton} disabled={!playing} onClick={() => dispatch({ type: 'RECORD', outcome: 'correct', now: performance.now() })}><Icon name="arrowUp" /> Correct</button></div>}
    <div className={styles.playBottom}><p className={styles.controlHint}>{motionMode ? "Screen to sky: Correct · Screen to ground: Skip · Return upright" : "Up arrow: Correct · Down arrow: Skip · Assisted play adds on-screen controls"}</p>{!ready && match.phase !== 'reviewing' && <button className={styles.textButton} onClick={() => { dispatch({ type: 'PAUSE', now: performance.now() }); setReset(true); }}>Reset turn</button>}</div>
    <p className={styles.turnNotice} role="status">{playing && seconds <= 10 ? seconds <= 5 ? 'Final seconds — last guesses!' : '10 seconds or less — keep the clues coming!' : playing && lastOutcome ? lastOutcome === 'correct' ? 'Correct! Next word.' : 'Skipped. Fresh start.' : '\u00a0'}</p>
    {match.phase === 'reviewing' && <Review match={match} />}
    {reset && match.phase === 'paused' && <GameDialog title="Start this turn over?" onCancel={() => setReset(false)}><p>This clears the current turn’s words and restores the timer. All earlier turns stay saved.</p><div className={styles.actions}><button className={styles.secondary} onClick={() => setReset(false)}>Keep turn paused</button><button className={styles.primary} onClick={() => { dispatch({ type: 'RESET' }); setReset(false); }}>Reset this turn</button></div></GameDialog>}
  </section>;
}

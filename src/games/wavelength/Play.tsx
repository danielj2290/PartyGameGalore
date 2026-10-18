import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Navigate } from 'react-router-dom';
import { Icon } from '../../components/Icon/Icon';
import { GameDialog } from '../shared/GameDialog';
import { useWavelength } from './WavelengthContext';
import { confirmTurn, currentSpectrum, otherTeam, totalFor, turnPoints } from './engine';
import { Dial } from './Dial';
import { Scoreboard } from './Scoreboard';
import styles from './Wavelength.module.css';

const titles = { ready: 'Clue-giver, take the device.', clue: 'Find your perfect clue.', handoff: 'Your clue is ready.', guess: 'Where does it belong?', opponent: 'Left or right?', reveal: 'Are you on the same wavelength?', paused: 'A little breathing room.', finished: 'Match complete.' };
export function Play() {
  const { match, dispatch, viewTarget, muted, toggleSound } = useWavelength();
  const [reset, setReset] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [match?.phase]);
  if (!match) return <Navigate to="/wavelength/settings" replace />;
  if (match.phase === 'finished') return <Navigate to="/wavelength/results" replace />;
  const { phase, team } = match;
  const opponent = otherTeam(team);
  const spectrum = currentSpectrum(match);
  const privateView = phase === 'clue';
  const seconds = Math.ceil(match.remainingMs / 1000);
  const points = turnPoints(match);
  const confirmed = phase === 'reveal' ? confirmTurn(match) : null;
  const finishes = confirmed?.phase === 'finished';
  const catchUp = confirmed && !finishes && confirmed.team === team;
  const tiebreak = confirmed && match.overtimeTurns === null && confirmed.overtimeTurns !== null;
  const pause = () => dispatch({ type: 'PAUSE', now: performance.now() });
  return <section className={styles.playScreen} style={{ '--team': team === 1 ? 'var(--pink)' : 'var(--blue)' } as CSSProperties}>
    <div className={styles.playHeading}><div><p className={styles.eyebrow}>TEAM {team} · {match.overtimeTurns !== null ? 'TIEBREAK' : match.settings.mode === 'rounds' ? `ROUND ${Math.floor(match.completed.length / 2) + 1} OF ${match.settings.rounds}` : `TURN ${match.completed.length + 1} · FIRST TO ${match.settings.goal}`}</p><h1 ref={heading} tabIndex={-1}>{titles[phase]}</h1></div>
      <div className={styles.timerPanel}>{phase === 'guess' && <span className={`${styles.timer} ${match.settings.seconds && seconds <= 10 ? styles.urgent : ''}`} role={match.settings.seconds ? 'timer' : undefined} aria-label={match.settings.seconds ? `${seconds} seconds remaining` : undefined}>{match.settings.seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'UNTIMED'}</span>}
        <div className={styles.timerControls}>{phase !== 'paused' && <button className={styles.smallButton} onClick={pause}>Pause</button>}<button className={styles.smallButton} aria-pressed={muted} aria-label={muted ? 'Unmute timer sounds' : 'Mute timer sounds'} onClick={toggleSound}>{muted ? 'Sound off' : 'Sound on'}</button></div>
      </div>
    </div>
    <div className={`${styles.gameCard} ${privateView ? styles.privateCard : ''}`}>
      <p className={styles.cardKicker}>{privateView ? 'PRIVATE · CLUE-GIVER ONLY' : phase === 'opponent' ? `TEAM ${opponent} · MAKE YOUR PREDICTION` : `TEAM ${team} · TRUST YOUR INSTINCTS`}</p>
      {phase === 'ready' ? <div className={styles.readyContent}><span className={styles.readyStar}><Icon name="burst" /></span><h2>Everyone else, look away.</h2><p>Pass the device to Team {team}&apos;s next clue-giver.<br />Only they should see the secret target.</p><button className={styles.primary} onClick={viewTarget}>Show my target <Icon name="arrowUpRight" /></button></div>
        : phase === 'paused' ? <div className={styles.readyContent}><Icon name="pause" /><h2>Game paused</h2><p>The target and clue are covered. Make sure the right players are looking before you resume.</p><button className={styles.primary} onClick={() => dispatch({ type: 'RESUME', now: performance.now() })}>{match.pausedFrom === 'clue' ? 'Resume private view' : 'Resume turn'} <Icon name="play" /></button></div>
          : phase === 'handoff' ? <div className={styles.readyContent}><Icon name="check" /><h2>Target hidden. Pass it over.</h2><p>Give the device to Team {team}&apos;s guessers. Clue-giver: stay silent and keep a straight face.</p><blockquote className={styles.handoffClue}>{match.clue}</blockquote><button className={styles.primary} onClick={() => dispatch({ type: 'BEGIN', now: performance.now() })}>We&apos;re ready to guess <Icon name="arrowUpRight" /></button></div>
            : <>
              {!privateView && <blockquote className={styles.clue}><span>THE CLUE</span>{match.clue}</blockquote>}
              <Dial spectrum={spectrum} guess={privateView ? undefined : match.guess}
                target={privateView || phase === 'reveal' ? match.target ?? undefined : undefined}
                onChange={phase === 'guess' ? value => dispatch({ type: 'GUESS', value, now: performance.now() }) : undefined} />
              {privateView && <form className={styles.clueForm} onSubmit={event => { event.preventDefault(); dispatch({ type: 'HIDE' }); }}>
                <label className={styles.field}>Your clue<input autoComplete="off" autoCapitalize="sentences" value={match.clue} maxLength={80} onChange={event => dispatch({ type: 'CLUE', value: event.target.value })} placeholder="One idea your team will recognize" required /><span>Aim for five words or fewer. No endpoint words or numeric hints.</span></label>
                <button className={styles.primary} disabled={!match.clue.trim()} type="submit">Hide target & pass to team <Icon name="arrowUpRight" /></button>
              </form>}
              {phase === 'guess' && <div className={styles.stageAction}><p>{match.settings.seconds && seconds <= 10 ? 'Last thoughts! The needle locks when time runs out.' : 'Discuss together. The clue-giver stays silent.'}</p><button className={styles.primary} onClick={() => dispatch({ type: 'LOCK', now: performance.now() })}>Lock our guess <Icon name="check" /></button></div>}
              {phase === 'opponent' && <div className={styles.opponentPanel}><h2>Team {opponent}, where is the target center?</h2><p>Compare it to the locked needle. A correct prediction can earn 1 point.</p><div className={styles.sideChoices} role="group" aria-label="Opposing team prediction">{(['left', 'right'] as const).map(side => <button key={side} className={styles.secondary} aria-pressed={match.side === side} onClick={() => dispatch({ type: 'SIDE', side })}><Icon name="arrowRight" className={side === 'left' ? styles.leftArrow : ''} />{side === 'left' ? 'Left of the needle' : 'Right of the needle'}</button>)}</div><button className={styles.primary} disabled={!match.side} onClick={() => dispatch({ type: 'REVEAL' })}>Reveal target <Icon name="sparkle" /></button></div>}
              {phase === 'reveal' && <div className={styles.revealPanel}>
                <div className={styles.pointAwards} aria-label="Points this turn"><div><span>TEAM {team}</span><strong>+{points.main}</strong><span>{points.main === 4 ? 'Bullseye!' : points.main ? 'In the target' : 'Outside the target'}</span></div><div><span>TEAM {opponent}</span><strong>+{points.bonus}</strong><span>{points.main === 4 ? 'Bullseye blocks the bonus' : points.bonus ? 'Correct prediction' : 'Prediction missed'}</span></div></div>
                <p className={styles.revealSummary} role="status">{finishes ? `Final totals after confirmation: Team 1 ${totalFor(confirmed!, 1)}, Team 2 ${totalFor(confirmed!, 2)}.` : tiebreak ? 'Tied at the goal! Each team gets a tiebreak turn.' : catchUp ? `Catch-up turn! Team ${team} hit the center and is still behind. Pick a new clue-giver.` : `Next up: Team ${confirmed?.team}. Choose a new clue-giver.`}</p>
                <button className={styles.primary} onClick={() => dispatch({ type: 'CONFIRM' })}>{finishes ? 'Confirm & see results' : 'Confirm & next turn'} <Icon name="arrowUpRight" /></button>
              </div>}
            </>}
    </div>
    <div className={styles.playBottom}><p>{phase === 'clue' ? 'Keep the screen private until the target is hidden.' : 'Center 4 · near 3 · edge 2 · miss 0'}</p><button className={styles.textButton} onClick={() => { pause(); setReset(true); }}>Reset turn</button></div>
    <Scoreboard match={match} />
    {reset && <GameDialog title="Start this turn over?" onCancel={() => setReset(false)}><p>This clears the clue and guesses. The clue-giver will get a fresh target. Confirmed turns stay saved.</p><div className={styles.actions}><button className={styles.secondary} onClick={() => setReset(false)}>Keep turn paused</button><button className={styles.primary} onClick={() => { dispatch({ type: 'RESET' }); setReset(false); }}>Reset this turn</button></div></GameDialog>}
  </section>;
}

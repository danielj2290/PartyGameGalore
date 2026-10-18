import type { CSSProperties } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon/Icon';
import { useWavelength } from './WavelengthContext';
import { totalFor } from './engine';
import { Dial } from './Dial';
import { Scoreboard } from './Scoreboard';
import styles from './Wavelength.module.css';

export function Results() {
  const { match } = useWavelength();
  const navigate = useNavigate();
  if (!match) return <Navigate to="/wavelength/settings" replace />;
  if (match.phase !== 'finished') return <Navigate to="/wavelength/play" replace />;
  const first = totalFor(match, 1), second = totalFor(match, 2);
  return <section className={styles.results}><p className={styles.eyebrow}>THAT'S THE FREQUENCY</p><span className={styles.resultsStar}><Icon name="burst" /></span>
    <h1 tabIndex={-1}>{first === second ? 'It’s a draw!' : `Team ${first > second ? 1 : 2} takes the crown.`}</h1>
    <p className={styles.lede}>Good instincts. Great company. A few very strong opinions.</p>
    <div className={styles.finalTotals} aria-label="Final scores"><div><span>TEAM 1</span><strong>{first}</strong><span>points</span></div><span aria-hidden="true">:</span><div><span>TEAM 2</span><strong>{second}</strong><span>points</span></div></div>
    <div className={styles.actions}><button className={styles.primary} onClick={() => navigate('/wavelength/settings')}>Play again <Icon name="arrowUpRight" /></button><Link className={styles.secondary} to="/">Exit home</Link></div>
    <Scoreboard match={match} /><h2 className={styles.historyHeading}>Every clue. Every close call.</h2>
    <div className={styles.historyGrid}>{match.completed.map((turn, index) => <details key={index} className={styles.historyTurn} style={{ '--team': turn.team === 1 ? 'var(--pink)' : 'var(--blue)' } as CSSProperties}>
      <summary><span>Turn {index + 1} · Team {turn.team}{turn.overtime ? ' · tiebreak' : ''}</span><strong>{turn.clue}</strong><span>{turn.main} points · opposing bonus {turn.bonus}</span></summary>
      <Dial spectrum={turn.spectrum} target={turn.target} guess={turn.guess} /><p>Opponents predicted {turn.side} of the needle.</p>
    </details>)}</div>
  </section>;
}

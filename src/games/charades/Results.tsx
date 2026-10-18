import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCharades } from './CharadesContext';
import { score, totalFor } from './engine';
import type { Team } from './engine';
import { Scoreboard } from './Scoreboard';
import styles from './Charades.module.css';

export function Results() {
  const { match } = useCharades();
  const navigate = useNavigate();
  if (!match) return <Navigate to="/charades/settings" replace />;
  if (match.phase !== 'finished') return <Navigate to="/charades/play" replace />;
  const first = totalFor(match, 1), second = totalFor(match, 2);
  return <section className={styles.results}>
    <p className={styles.eyebrow}>THAT’S A WRAP</p><span className={styles.resultsStar} aria-hidden="true">✳</span>
    <h1 tabIndex={-1}>{first === second ? 'It’s a draw!' : `Team ${first > second ? 1 : 2} takes the crown.`}</h1>
    <p className={styles.lede}>Big moves. Good company. One for the memory bank.</p>
    <div className={styles.finalTotals}><div><span>TEAM 1</span><strong>{first}</strong><span>points</span></div><span aria-hidden="true">:</span><div><span>TEAM 2</span><strong>{second}</strong><span>points</span></div></div>
    <div className={styles.actions}><button className={styles.primary} onClick={() => navigate('/charades/settings')}>Play again ↗</button><Link className={styles.secondary} to="/">Exit home</Link></div>
    <Scoreboard match={match} />
    <h2 className={styles.historyHeading}>Every word. Every round.</h2>
    <div className={styles.historyGrid}>{([1, 2] as Team[]).map(team => <section key={team} className={`${styles.historyTeam} ${team === 1 ? styles.teamPink : styles.teamBlue}`}><h3>Team {team}</h3>{match.completed.filter(turn => turn.team === team).map(turn => <details key={turn.round}><summary>Round {turn.round}<span>{score(turn.entries)} points</span></summary><ul>{turn.entries.map((entry, index) => <li key={`${entry.word.id}-${index}`}><span>{entry.word.text}</span><span className={entry.outcome === 'correct' ? styles.correctLabel : styles.hint}>{entry.outcome === 'correct' ? 'Correct · +1' : entry.outcome === 'skipped' ? 'Skipped' : 'Unanswered'}</span></li>)}</ul></details>)}</section>)}</div>
  </section>;
}
